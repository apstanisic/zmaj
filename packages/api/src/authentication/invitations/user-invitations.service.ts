import { throw400 } from "@api/common/throw-http"
import type { CreateFinishEvent } from "@api/crud/crud-event.types"
import { OnCrudEvent } from "@api/crud/on-crud-event.decorator"
import { EmailCallbackService } from "@api/email/email-callback.service"
import { EmailService } from "@api/email/email.service"
import { emsg } from "@api/errors"
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
import { Orm, OrmRepository } from "@zmaj-js/orm"
import { z } from "zod"

const USED_FOR_USER_INVITATION = "USED_FOR_USER_INVITATION"
const schema = z.object({
	type: z.literal(USED_FOR_USER_INVITATION),
	sub: z.string().uuid(),
})

@Injectable()
export class UserInvitationsService {
	readonly repo: OrmRepository<UserModel>
	constructor(
		private orm: Orm,
		private usersService: UsersService, //
		private emailService: EmailService,
		private emailCallbackService: EmailCallbackService,
	) {
		this.repo = this.orm.getRepo(UserModel)
	}

	async acceptInvitation(params: ConfirmUserInvitationDto): Promise<{ email: string }> {
		const data = await this.emailCallbackService.verifyJwtCallback({
			token: params.token,
			schema: schema,
		})

		const user = await this.repo.findOne({
			where: { id: data.sub, status: "invited" }, //
		})
		// We don't want to expose to them that user is not invited
		if (!user) throw400(738299, emsg.emailTokenExpired)

		await this.orm.transaction({
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
			},
		})
		return { email: user.email }
	}

	@OnCrudEvent({ action: "create", collection: UserCollection, type: "finish" })
	async __sendInvitationEmail(event: CreateFinishEvent<User>): Promise<void> {
		for (const user of event.result) {
			if (user.status !== "invited") continue

			try {
				const url = await this.emailCallbackService.createJwtCallbackUrl({
					path: getEndpoints((e) => e.auth.invitation).redirectToForm,
					expiresIn: "30d",
					userId: user.id,
					usedFor: USED_FOR_USER_INVITATION,
					data: { email: user.email },
				})

				await this.emailService.sendEmail({
					to: user.email,
					subject: "Invitation",
					html: emailTemplates.inviteUser({
						ZMAJ_APP_NAME: this.emailService["globalConfig"].name,
						ZMAJ_URL: url.toString(),
					}),
					text: `Go to ${url} to confirm invitation`,
				})
			} catch (error) {
				// ignore error, since there can be multiple users, we don't want to stop at first
				// this will create user, but won't create token and send email and
			}
		}
	}
}
