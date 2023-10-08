import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { ParseStringPipe } from "@api/common/parse-string.pipe"
import { Controller, Get, Put, Query } from "@nestjs/common"
import { AuthUser, ChangeEmailDto, endpoints } from "@zmaj-js/common"
import { GetUser } from "../get-user.decorator"
import { EmailChangeService } from "./email-change.service"

const ep = endpoints.auth.account.emailChange

@Controller(ep.$base)
export class EmailChangeController {
	constructor(private service: EmailChangeService) {}

	@SetSystemPermission("account", "updateEmail")
	@Put(ep.request)
	async requestEmailChange(
		@GetUser({ required: true }) user: AuthUser,
		@DtoBody(ChangeEmailDto) data: ChangeEmailDto,
	): Promise<{ newEmail: string; currentEmail: string }> {
		return this.service.requestEmailChange(user, data)
	}

	// @SetSystemPermission("account", "updateEmail")
	@Get(ep.confirm)
	async setNewEmail(@Query("token", ParseStringPipe) token: string): Promise<{ email: string }> {
		return this.service.setNewEmail({ token })
	}
}
