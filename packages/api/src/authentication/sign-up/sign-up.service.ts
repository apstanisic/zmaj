import { throw403 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { RuntimeSettingsService } from "@api/runtime-settings/runtime-settings.service"
import { SecurityTokensService } from "@api/security-tokens/security-tokens.service"
import { UsersService } from "@api/users/users.service"
import { Injectable, Logger } from "@nestjs/common"
import { getEndpoints, SignUpDto, User, UserCreateDto } from "@zmaj-js/common"
import { emailTemplates } from "@zmaj-js/email-templates"
import { addMonths } from "date-fns"
import { SetOptional } from "type-fest"
import { AuthenticationConfig } from "../authentication.config"

const USED_FOR_EMAIL_CONFIRM = "email-confirm"

@Injectable()
export class SignUpService {
	private logger = new Logger(SignUpService.name)
	constructor(
		private readonly usersService: UsersService,
		// private readonly keyValService: KeyValueStorageService,
		private readonly authConfig: AuthenticationConfig,
		private readonly tokenService: SecurityTokensService,
		private readonly settings: RuntimeSettingsService,
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

		await this.tokenService.createTokenWithEmailConfirmation({
			token: {
				usedFor: USED_FOR_EMAIL_CONFIRM,
				userId: user.id,
				validUntil: addMonths(new Date(), 3),
			},
			redirectPath: getEndpoints((e) => e.auth.signUp).confirmEmail,
			emailParams: (url, appName) => ({
				subject: "Confirm email",
				to: user.email,
				text: `Go to ${url} to confirm email`,
				html: emailTemplates.confirmEmail({ ZMAJ_APP_NAME: appName, ZMAJ_URL: url }),
			}),
		})

		return user
	}

	async confirmEmail(userId: string, token: string): Promise<{ email: string }> {
		const tokenInDb = await this.tokenService.findToken({
			token,
			usedFor: USED_FOR_EMAIL_CONFIRM,
			userId,
		})
		if (!tokenInDb) throw403(6788999, emsg.emailTokenExpired)
		const user = await this.usersService.findUser({ id: userId })
		if (user?.status !== "emailUnconfirmed") throw403(3678833, emsg.noAuthz)
		await this.usersService.updateUser({ userId, data: { confirmedEmail: true, status: "active" } })
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
