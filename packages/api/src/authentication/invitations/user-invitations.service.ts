import { throw400 } from "@api/common/throw-http"
import type { CreateFinishEvent } from "@api/crud/crud-event.types"
import { OnCrudEvent } from "@api/crud/on-crud-event.decorator"
import { emsg } from "@api/errors"
import { SecurityTokensService } from "@api/security-tokens/security-tokens.service"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import {
	ConfirmUserInvitationDto,
	getEndpoints,
	User,
	UserCollection,
	UserModel,
} from "@zmaj-js/common"
import { emailTemplates } from "@zmaj-js/email-templates"
import { OrmRepository, RepoManager } from "@zmaj-js/orm"
import { addMonths } from "date-fns"

const USED_FOR_USER_INVITATION = "USED_FOR_USER_INVITATION"

@Injectable()
export class UserInvitationsService {
	readonly repo: OrmRepository<UserModel>
	constructor(
		private repoManager: RepoManager,
		private tokensService: SecurityTokensService, //
		private usersService: UsersService, //
	) {
		this.repo = this.repoManager.getRepo(UserModel)
	}

	async acceptInvitation(params: ConfirmUserInvitationDto): Promise<{ email: string }> {
		const user = await this.repo.findOne({ where: { email: params.email, status: "invited" } })
		// We don't want to expose to them that user is not invited
		if (!user) throw400(738299, emsg.emailTokenExpired)
		const token = await this.tokensService.findToken({
			token: params.token,
			usedFor: USED_FOR_USER_INVITATION,
			userId: user.id,
		})
		if (!token) throw400(38999, emsg.emailTokenExpired)

		await this.repoManager.transaction({
			fn: async (trx) => {
				const { firstName, lastName, password } = params

				await this.repo.updateById({
					trx,
					id: user.id,
					changes: {
						firstName,
						lastName,
						status: "active",
						confirmedEmail: true,
					},
				})
				await this.usersService.setPassword({
					userId: user.id,
					newPassword: password,
					trx,
				})
				// await this.passwordService.setPassword(user.id, password)
				await this.tokensService.deleteUserTokens({
					userId: user.id,
					trx,
					usedFor: USED_FOR_USER_INVITATION,
				})
			},
		})
		return { email: user.email }
	}

	@OnCrudEvent({ action: "create", collection: UserCollection, type: "finish" })
	async __sendInvitationEmail(event: CreateFinishEvent<User>): Promise<void> {
		for (const user of event.result) {
			if (user.status === "invited") {
				await this.tokensService
					.createTokenWithEmailConfirmation({
						trx: event.trx,
						token: {
							usedFor: USED_FOR_USER_INVITATION,
							userId: user.id,
							validUntil: addMonths(new Date(), 1),
						},
						urlQuery: { email: user.email },
						redirectPath: getEndpoints((e) => e.auth.invitation).redirectToForm,
						emailParams: (url, appName) => {
							return {
								to: user.email, //
								subject: "Invitation",
								html: emailTemplates.inviteUser({ ZMAJ_APP_NAME: appName, ZMAJ_URL: url }),
								text: `Go to ${url} to confirm invitation`,
							}
						},
					})
					// ignore error, since there can be multiple users, we don't want to stop at first
					// this will create user, but won't create token and send email and
					.catch(() => {})
			}
		}
	}
}
