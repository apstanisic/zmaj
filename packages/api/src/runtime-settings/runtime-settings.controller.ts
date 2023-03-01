import { GetUser } from "@api/authentication/get-user.decorator"
import { MustBeAdmin } from "@api/authorization/admin.guard"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { Controller, Get, Put } from "@nestjs/common"
import { AuthUser, ChangeSettingsDto, endpoints, Settings } from "@zmaj-js/common"
import { RuntimeSettingsService } from "./runtime-settings.service"

const ep = endpoints.dynamicSettings

@Controller(ep.$base)
export class DynamicSettingsController {
	constructor(private service: RuntimeSettingsService) {}

	@MustBeAdmin()
	@Get(ep.getSettings)
	async getSettings(): Promise<Settings> {
		return this.service.getSettings()
	}

	/**
	 * TODO Maybe add this
	 * @param body
	 * @param user
	 */
	@MustBeAdmin()
	@Put(ep.setSettings)
	async changeSettings(
		@DtoBody(ChangeSettingsDto) data: ChangeSettingsDto,
		@GetUser({ required: true }) user: AuthUser,
	): Promise<Settings> {
		return this.service.setSettings(data, user)
	}
}
