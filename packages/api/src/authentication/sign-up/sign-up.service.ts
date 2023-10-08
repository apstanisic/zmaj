import { GlobalConfig } from "@api/app/global-app.config"
import { throw403 } from "@api/common/throw-http"
import { EmailCallbackService } from "@api/email/email-callback.service"
import { EmailService } from "@api/email/email.service"
import { emsg } from "@api/errors"
import { RuntimeSettingsService } from "@api/runtime-settings/runtime-settings.service"
import { UsersService } from "@api/users/users.service"
import { Injectable, Logger } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { SignUpDto, User, UserCreateDto, getEndpoints } from "@zmaj-js/common"
import { emailTemplates } from "@zmaj-js/email-templates"
import { SetOptional } from "type-fest"
import { z } from "zod"
import { AuthenticationConfig } from "../authentication.config"

const USED_FOR_EMAIL_CONFIRM = "email-confirm"

const confirmEmailTokenSchema = z.object({
	type: z.literal(USED_FOR_EMAIL_CONFIRM),
	sub: z.string().uuid(),
})

@Injectable()
export class SignUpService {
	private logger = new Logger(SignUpService.name)
	constructor(
		private readonly usersService: UsersService,
		private readonly authConfig: AuthenticationConfig,
		private readonly settings: RuntimeSettingsService,
		private readonly emailService: EmailService,
		private readonly emailCallbackService: EmailCallbackService,
		private readonly globalConfig: GlobalConfig,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * Register new user
	 * @param data user data
	 * @param additionalData Data that is never passed from user, and is safe to be used without
	 * validation. Useful for custom sign up (oidc...)
	 */
	async signUp(
		data: SetOptional<SignUpDto, "firstName" | "lastName">,
		additionalData?: Partial<User>,
	): Promise<User> {
		const signUpAllowed = await this.isSignUpAllowed()
		if (!signUpAllowed) throw403(1087289, emsg.noAuthz)

		const settings = this.settings.getSettings()
		const defaultRole = settings.data.defaultSignUpRole

		// const { password, ...userInfo } = data
		// if user provided status, use that, if email confirmed set active, otherwise check confirm
		// to see if we should wait for confirmation
		let status: User["status"]
		if (additionalData?.status) {
			status = additionalData.status
		} else if (additionalData?.confirmedEmail === true) {
			status = "active"
		} else {
			status = this.authConfig.requireEmailConfirmation ? "emailUnconfirmed" : "active"
		}

		const user = await this.usersService.createUser({
			data: new UserCreateDto({
				...data,
				roleId: defaultRole,
				...additionalData,
				status,
			}),
		})

		const url = await this.emailCallbackService.createJwtCallbackUrl({
			userId: user.id,
			expiresIn: "30d",
			path: getEndpoints((e) => e.auth.signUp).confirmEmail, //
			usedFor: USED_FOR_EMAIL_CONFIRM,
		})

		await this.emailService.sendEmail({
			subject: "Confirm email",
			to: user.email,
			text: `Go to ${url} to confirm email`,
			html: emailTemplates.confirmEmail({
				ZMAJ_APP_NAME: this.globalConfig.name,
				ZMAJ_URL: url.toString(),
			}),
		})

		return user
	}

	async confirmEmail(token: string): Promise<{ email: string }> {
		const data = await this.emailCallbackService.verifyJwtCallback({
			token,
			schema: confirmEmailTokenSchema,
		})

		const user = await this.usersService.findUser({ id: data.sub })
		if (user?.status !== "emailUnconfirmed") throw403(3678833, emsg.noAuthz)
		await this.usersService.updateUser({
			userId: user.id,
			data: { confirmedEmail: true, status: "active" },
		})
		return { email: user.email }
	}

	/**
	 * Check if sign up is allowed
	 *
	 * It is stored in DB so admin can easily change that setting
	 * It will fallback to
	 */
	async isSignUpAllowed(): Promise<boolean> {
		if (this.authConfig.allowSignUp !== "dynamic") return this.authConfig.allowSignUp

		const settings = this.settings.getSettings()
		return settings.data.signUpAllowed
	}

	// async setSignUpAllowed(allowed: boolean, user: AuthUser): Promise<void> {
	// 	if (user.roleId !== ADMIN_ROLE_ID) throw403(784230, emsg.noAuthz)
	// 	if (typeof this.authConfig.allowSignUp === "boolean") throw403(82033, emsg.settingsReadonly)
	// 	await this.keyValService.updateOrCreate({
	// 		key: SettingsKey.ALLOW_SIGN_UP,
	// 		value: allowed ? "true" : "false",
	// 		namespace: SettingsKey.NAMESPACE,
	// 	})
	// }

	// // todo check first if role exist
	// async setDefaultRole(roleId: string, user: AuthUser): Promise<void> {
	//   if (user.roleId !== ADMIN_ROLE_ID) throw403(784230)
	//   // Check if role exist
	//   // if (typeof this.authConfig.allowSignUp === "boolean") throw403(82033)
	//   await this.keyValService.updateOrCreate({
	//     key: SettingsKey.DEFAULT_ROLE_ID,
	//     value: roleId,
	//     namespace: SettingsKey.NAMESPACE,
	//   })
	// }
}
