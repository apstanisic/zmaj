import { GlobalConfig } from "@api/app/global-app.config"
import { Error403, throw403 } from "@api/common/throw-http"
import { EmailCallbackService } from "@api/email/email-callback.service"
import { EmailService } from "@api/email/email.service"
import { emsg } from "@api/errors"
import { UsersService } from "@api/users/users.service"
import { Injectable, Logger } from "@nestjs/common"
import { PUBLIC_ROLE_ID, SignUpDto, User, UserCreateDto, getEndpoints } from "@zmaj-js/common"
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
		private readonly emailService: EmailService,
		private readonly emailCallbackService: EmailCallbackService,
		private readonly globalConfig: GlobalConfig,
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
		if (!this.authConfig.allowSignUp) throw403(1087289, emsg.noAuthz)

		// const { password, ...userInfo } = data
		// if user provided status, use that, if email confirmed set active, otherwise check confirm
		// to see if we should wait for confirmation
		let status: User["status"]
		if (additionalData?.status) {
			status = additionalData.status
		} else if (additionalData?.confirmedEmail) {
			status = "active"
		} else {
			status = this.authConfig.requireEmailConfirmation ? "emailUnconfirmed" : "active"
		}

		const user = await this.usersService.createUser({
			data: new UserCreateDto({
				...data,
				roleId: PUBLIC_ROLE_ID,
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
		if (user?.status !== "emailUnconfirmed" && user?.status !== "active") {
			throw new Error403(3678833, emsg.noAuthz)
		}
		await this.usersService.updateUser({
			userId: user.id,
			data: { confirmedEmail: true, status: "active" },
		})
		return { email: user.email }
	}
}
