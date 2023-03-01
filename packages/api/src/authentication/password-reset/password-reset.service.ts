import { GlobalConfig } from "@api/app/global-app.config"
import { AuthorizationService } from "@api/authorization/authorization.service"
import { throw401, throw403 } from "@api/common/throw-http"
import { EmailService } from "@api/email/email.service"
import { emsg } from "@api/errors"
import { SecurityTokensService } from "@api/security-tokens/security-tokens.service"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import { AuthUser, Email, getEndpoints, PasswordResetDto } from "@zmaj-js/common"
import { emailTemplates } from "@zmaj-js/email-templates"
import { addHours, isPast } from "date-fns"
import { AuthenticationConfig } from "../authentication.config"

const USED_FOR_PASSWORD_RESET = "password-reset"
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
		private tokensService: SecurityTokensService,
		private authzService: AuthorizationService,
		private authnConfig: AuthenticationConfig,
		private config: GlobalConfig, // private repoManager: RepoManager,
	) {}

	/**
	 * Send instructions to reset password
	 * If invalid email in any way, just don't say anything.
	 * @param email to send reset instructions
	 */
	async sendResetPasswordEmail(email: Email): Promise<void> {
		if (this.authnConfig.passwordReset !== "reset-email") throw403(270903, emsg.noAuthz)

		// Don't throw if user does not exists, simply return
		// we do not want user to know if this account exists
		const fullUser = await this.usersService.findActiveUser({ email }).catch(() => undefined)
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

		// Only one token can be valid at the same time, reduces security concerns
		// await this.tokensService.deleteAllUserTokens({ userId: fullUser.id })

		await this.tokensService.createTokenWithEmailConfirmation({
			token: {
				usedFor: USED_FOR_PASSWORD_RESET,
				userId: fullUser.id,
				validUntil: addHours(new Date(), 3),
			},
			urlQuery: { email },
			redirectPath: getEndpoints((e) => e.auth.passwordReset).redirectToForm, // "auth/password-reset/reset",
			deleteOld: "usedFor",
			emailParams: (url, appName) => ({
				to: email,
				subject: "Reset password",
				html: emailTemplates.passwordReset({ ZMAJ_APP_NAME: appName, ZMAJ_URL: url }),
				text: `Go to ${url} to reset password`,
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
	async setNewPassword({ email, token, password }: PasswordResetDto): Promise<void> {
		const fullUser = await this.usersService.findActiveUser({ email })
		const user = AuthUser.fromUser(fullUser)

		this.authzService.checkSystem("account", "resetPassword", { user }) ||
			throw403(927134, emsg.noAuthz)

		const tokenInDb = await this.tokensService.findToken({
			token,
			userId: fullUser.id,
			usedFor: USED_FOR_PASSWORD_RESET,
		})

		if (!tokenInDb) throw401(8816, emsg.emailTokenExpired)
		if (isPast(tokenInDb.validUntil)) throw401(901231, emsg.emailTokenExpired)

		await this.tokensService.deleteUserTokens({ userId: user.userId })
		await this.usersService.setPassword({ newPassword: password, userId: tokenInDb.userId })
	}
}
