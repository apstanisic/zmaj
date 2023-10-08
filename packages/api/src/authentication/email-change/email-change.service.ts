import { GlobalConfig } from "@api/app/global-app.config"
import { AuthorizationService } from "@api/authorization/authorization.service"
import { throw400, throw403 } from "@api/common/throw-http"
import { EmailCallbackService } from "@api/email/email-callback.service"
import { EmailService } from "@api/email/email.service"
import { emsg } from "@api/errors"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { AuthUser, ChangeEmailDto, getEndpoints } from "@zmaj-js/common"
import { emailTemplates } from "@zmaj-js/email-templates"
import { z } from "zod"

const USED_FOR_CHANGE_EMAIL = "email-change"

const changeEmailTokenSchema = z.object({
	/** User's current email */
	current: z.string().email(),
	/** Email that user wants to set */
	next: z.string().email(),
	/** User's ID */
	sub: z.string().uuid(),
	/** Ensure that this is used for only this purpose */
	type: z.literal(USED_FOR_CHANGE_EMAIL),
})
type ChangeEmailToken = z.infer<typeof changeEmailTokenSchema>

@Injectable()
export class EmailChangeService {
	constructor(
		private readonly users: UsersService,
		private readonly authz: AuthorizationService,
		private readonly jwtService: JwtService,
		private readonly emailService: EmailService,
		private readonly globalConfig: GlobalConfig,
		private readonly emailCallbackService: EmailCallbackService,
	) {}

	async requestEmailChange(
		user: AuthUser,
		{ newEmail, password }: ChangeEmailDto,
	): Promise<{ newEmail: string; currentEmail: string }> {
		this.authz.checkSystem("account", "updateEmail", { user }) || throw403(978432, emsg.noAuthz)

		const validPassword = await this.users.checkPassword({ userId: user.userId, password })

		if (!validPassword) throw400(90417, emsg.invalidPassword)

		const url = await this.emailCallbackService.createJwtCallbackUrl<
			typeof changeEmailTokenSchema
		>({
			expiresIn: "6h",
			path: getEndpoints((e) => e.auth.account.emailChange).confirm,
			usedFor: USED_FOR_CHANGE_EMAIL,
			userId: user.userId,
			data: {
				current: user.email,
				next: newEmail,
			},
		})

		await this.emailService.sendEmail({
			subject: "Confirm email change",
			to: newEmail,
			text: `Go to ${url} to confirm email change`,
			html: emailTemplates.emailChange({
				ZMAJ_APP_NAME: this.globalConfig.name,
				ZMAJ_URL: url.toString(),
			}),
		})

		return { newEmail, currentEmail: user.email }
	}

	/**
	 *
	 */
	async setNewEmail({ token }: { token: string }): Promise<{ email: string }> {
		const data = await this.emailCallbackService.verifyJwtCallback({
			token,
			schema: changeEmailTokenSchema,
		})

		const dbUser = await this.users.findActiveUser({ id: data.sub })
		if (dbUser.email !== data.current) throw403(9388990, emsg.emailTokenExpired)

		const user = AuthUser.fromUser(dbUser)
		this.authz.checkSystem("account", "updateEmail", { user }) ||
			throw403(9074012, emsg.noAuthz)

		const email = data.next

		await this.users.updateUser({ userId: user.userId, data: { email } })

		return { email }
	}
}
