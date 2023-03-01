import { GlobalConfig } from "@api/app/global-app.config"
import type { RedirectResponse } from "@api/common"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { ParseEmailPipe } from "@api/common/parse-email.pipe"
import { Controller, Get, ParseUUIDPipe, Put, Query, Redirect } from "@nestjs/common"
import { ConfirmUserInvitationDto, endpoints, qsStringify } from "@zmaj-js/common"
import { UserInvitationsService } from "./user-invitations.service"

const ep = endpoints.auth.invitation

@Controller(ep.$base)
export class UserInvitationsController {
	constructor(
		private globalConfig: GlobalConfig, //
		private invitationsService: UserInvitationsService,
	) {}

	@Redirect()
	@Get(ep.redirectToForm)
	redirectToForm(
		@Query("email", ParseEmailPipe) email: string,
		@Query("token", ParseUUIDPipe) token: string,
	): RedirectResponse {
		const query = qsStringify({ email, token })
		return {
			statusCode: 303,
			url: this.globalConfig.joinWithAdminPanelUrl(`#/auth/invite?${query}`),
		}
	}

	@Put(ep.confirm)
	async confirmInvitation(
		@DtoBody(ConfirmUserInvitationDto) dto: ConfirmUserInvitationDto,
	): Promise<{ success: boolean }> {
		await this.invitationsService.acceptInvitation(dto)
		return { success: true }
	}
}
