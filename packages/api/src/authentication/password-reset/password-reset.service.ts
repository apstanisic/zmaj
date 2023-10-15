import { GlobalConfig } from "@api/app/global-app.config"
import { AuthorizationService } from "@api/authorization/authorization.service"
import { Error401, Error403 } from "@api/common/throw-http"
import { EmailCallbackService } from "@api/email/email-callback.service"
import { EmailService } from "@api/email/email.service"
import { EncryptionService } from "@api/encryption/encryption.service"
import { emsg } from "@api/errors"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import { AuthUser, Email, PasswordResetDto, getEndpoints } from "@zmaj-js/common"
import { emailTemplates } from "@zmaj-js/email-templates"
import { z } from "zod"
import { AuthenticationConfig } from "../authentication.config"

const USED_FOR_PASSWORD_RESET = "password-reset"

const schema = z.object({
	type: z.literal(USED_FOR_PASSWORD_RESET),
	sub: z.string().uuid(),
	/** We are using JTI to store hmac of last part of the password hash, so user can't use reset multiple times  */
	jti: z.string().min(10).max(300),
})

/**
 * Password reset service
 * Used for generating token and sending email
 * And for resetting password in db and invalidating previous logins
 */
@Injectable()
export class PasswordResetService {
	constructor(
		private emailService: EmailService,
		private usersService: UsersService,
		private authzService: AuthorizationService,
		private authnConfig: AuthenticationConfig,
		private config: GlobalConfig,
		private encryptionService: EncryptionService,
		private emailCallbackService: EmailCallbackService,
		private globalConfig: GlobalConfig,
	) {}

	/**
	 * Password is hashed + encrypted, we take last 12 chars of that string,
	 * and use it to create unique identifier. That will guarantee that only
	 * can only use password reset if password wasn't changed
	 */
	passwordToHmac(fullPasswordHash: string): { sectionUsed: string; hmac: string } {
		const sectionUsed = fullPasswordHash.slice(-12)
		const hmac = this.encryptionService.createHmac(sectionUsed)
		return { sectionUsed, hmac }
	}

	/**
	 * Send instructions to reset password
	 * If invalid email in any way, just don't say anything.
	 * @param email to send reset instructions
	 */
	async sendResetPasswordEmail(email: Email): Promise<void> {
		if (this.authnConfig.passwordReset !== "reset-email") {
			throw new Error403(270903, emsg.noAuthz)
		}

		// Don't throw if user does not exists, simply return
		// we do not want user to know if this account exists
		const fullUser = await this.usersService.repo.findOne({
			where: {
				status: "active",
				email,
			},
			includeHidden: true,
		})
		if (!fullUser) return

		const user = AuthUser.fromUser(fullUser)

		// don't do anything if not allowed
		const allowed = this.authzService.checkSystem("account", "resetPassword", { user })
		if (!allowed) {
			await this.emailService.sendEmail({
				to: email,
				subject: `Reset password`,
				text: `You can not reset password currently. Please contact us so we can help you.`,
				html: emailTemplates.passwordResetForbidden({ ZMAJ_APP_NAME: this.config.name }),
			})
			return
		}

		const { hmac } = this.passwordToHmac(fullUser.password)
		const url = await this.emailCallbackService.createJwtCallbackUrl<typeof schema>({
			expiresIn: "6h",
			path: getEndpoints((e) => e.auth.passwordReset).redirectToForm,
			usedFor: USED_FOR_PASSWORD_RESET,
			userId: user.userId,
			data: { jti: hmac },
		})

		await this.emailService.sendEmail({
			to: user.email,
			subject: "Reset password",
			text: `Go to ${url.toString()} to reset password`,
			html: emailTemplates.passwordReset({
				ZMAJ_APP_NAME: this.globalConfig.name,
				ZMAJ_URL: url.toString(),
			}),
		})
	}

	/**
	 * Change password in DB
	 *
	 * Check if token is valid and not expired, and change password in db
	 * @param newPassword new password to be hashed in db
	 * @throws if there is no token, user, or token has expired
	 *
	 * @todo Should I delete all active sessions
	 */
	async setNewPassword({ token, password }: PasswordResetDto): Promise<void> {
		const jwtData = await this.emailCallbackService.verifyJwtCallback({
			token,
			schema,
		})
		const hmac = jwtData.jti

		const fullUser = await this.usersService.repo.findOne({
			includeHidden: true,
			where: { id: jwtData.sub, status: "active", confirmedEmail: true },
		})

		if (!fullUser) throw new Error401(89932, emsg.emailTokenExpired)

		const { sectionUsed } = this.passwordToHmac(fullUser.password)
		if (!this.encryptionService.verifyHmac(sectionUsed, hmac)) {
			throw new Error403(93999, emsg.emailTokenExpired)
		}

		const user = AuthUser.fromUser(fullUser)

		if (!this.authzService.checkSystem("account", "resetPassword", { user })) {
			throw new Error403(927134, emsg.noAuthz)
		}

		await this.usersService.setPassword({ newPassword: password, userId: user.userId })
	}
}
