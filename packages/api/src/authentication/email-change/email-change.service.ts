import { AuthorizationService } from "@api/authorization/authorization.service"
import { throw400, throw401, throw403, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { SecurityTokensService } from "@api/security-tokens/security-tokens.service"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import { AuthUser, ChangeEmailDto, getEndpoints, isEmail } from "@zmaj-js/common"
import { emailTemplates } from "@zmaj-js/email-templates"
import { addHours } from "date-fns"

const USED_FOR_CHANGE_EMAIL = "email-change"

@Injectable()
export class EmailChangeService {
	constructor(
		private readonly users: UsersService,
		private readonly tokens: SecurityTokensService,
		private readonly authz: AuthorizationService,
	) {}

	async requestEmailChange(
		user: AuthUser,
		{ newEmail, password }: ChangeEmailDto,
	): Promise<{ newEmail: string; currentEmail: string }> {
		this.authz.checkSystem("account", "updateEmail", { user }) || throw403(978432, emsg.noAuthz)

		const validPassword = await this.users.checkPassword({ userId: user.userId, password })

		if (!validPassword) throw400(90417, emsg.invalidPassword)

		await this.tokens.createTokenWithEmailConfirmation({
			token: {
				userId: user.userId,
				usedFor: USED_FOR_CHANGE_EMAIL,
				validUntil: addHours(new Date(), 3),
				data: newEmail,
			},
			redirectPath: getEndpoints((e) => e.auth.account.emailChange).confirm,
			urlQuery: { userId: user.userId },
			emailParams: (url, appName) => ({
				subject: "Confirm email change",
				text: `Go to ${url} to confirm email change`,
				to: newEmail,
				html: emailTemplates.emailChange({ ZMAJ_APP_NAME: appName, ZMAJ_URL: url }),
			}),
		})

		return { newEmail, currentEmail: user.email }
	}

	/**
	 *
	 */
	async setNewEmail({
		userId,
		token,
	}: {
		userId: string
		token: string
	}): Promise<{ email: string }> {
		const dbUser = await this.users.findActiveUser({ id: userId })
		const user = AuthUser.fromUser(dbUser)
		this.authz.checkSystem("account", "updateEmail", { user }) || throw403(9074012, emsg.noAuthz)

		const savedToken = await this.tokens.findToken({
			userId,
			token,
			usedFor: USED_FOR_CHANGE_EMAIL,
		})

		if (!savedToken) throw401(41027, emsg.emailTokenExpired)

		const email = savedToken.data ?? ""

		if (!isEmail(email)) throw500(74512)

		await this.tokens.deleteUserTokens({ userId: user.userId })
		await this.users.updateUser({ userId: user.userId, data: { email } })

		return { email }
	}
}
