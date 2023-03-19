import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { Controller, Post } from "@nestjs/common"
import { StructDto, SignInDto, endpoints } from "@zmaj-js/common"
import { RequestMfaPrompt } from "./mfa/request-mfa-prompt.type"
import { SignInService } from "./sign-in.service"

const ep = endpoints.auth.signIn2

const checkEmailPassword = ["/check-params", { paramsValid: true, hasMfa: true }]
const signIn = ["/sign-in", { parmas: "" }]

@Controller(ep.$base)
export class SignInController {
	constructor(private service: SignInService) {}

	@Post(ep.checkIfHasMfa)
	async checkIfHasMfa(
		@DtoBody(SignInDto) dto: SignInDto,
	): Promise<{}> {
		return this.service.hasMfa(dto)
	}

	@Post(ep.requestToEnableOtp)
	async getParamsToEnableMfa(
		@DtoBody(SignInDto) dto: SignInDto,
	): Promise<RequestMfaPrompt> {
		return this.service.requestMfaPrompt(dto)
	}

	@Post(ep.signIn)
	async signIn(
		@DtoBody(SignInDto) dto: SignInDto,
	): Promise<{ enabled: boolean; required: boolean }> {
		return this.service.hasMfa(dto)
	}
}
