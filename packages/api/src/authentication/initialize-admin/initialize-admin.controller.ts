import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { Controller, Post } from "@nestjs/common"
import { AuthUser, endpoints, SignUpDto } from "@zmaj-js/common"
import { InitializeAdminService } from "./initialize-admin.service"

const ep = endpoints.auth.initAdmin

@Controller(ep.$base)
export class InitializeAdminController {
	constructor(private service: InitializeAdminService) {}

	// @Get("is-initialized")
	// async isInitialized(): Promise<{ initialized: boolean }> {
	// 	const status = await this.service.isAdminInitialized()
	// 	return { initialized: status }
	// }

	@Post(ep.init)
	async initializeAdmin(@DtoBody(SignUpDto) body: SignUpDto): Promise<AuthUser> {
		return this.service.createAdminSafe(body)
	}
}
