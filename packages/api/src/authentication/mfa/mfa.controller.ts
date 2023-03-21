import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { Controller, Get, Post, Put } from "@nestjs/common"
import {
	AuthUser,
	endpoints,
	OtpDisableDto,
	OtpEnableDto,
	SignInDto,
	StructDto,
} from "@zmaj-js/common"
import { GetUser } from "../get-user.decorator"
import { RequestMfaPrompt } from "./request-mfa-prompt.type"
import { UsersMfaService } from "./users-mfa.service"

const ep = endpoints.auth.mfa

@Controller(ep.$base)
export class MfaController {
	constructor(private enableMfa: UsersMfaService) {}

	@Get(ep.requestToEnableOtp)
	async requestOtpEnable(
		@GetUser({ required: true }) user: AuthUser,
	): Promise<{ image: string; secret: string; jwt: string; backupCodes: string[] }> {
		return this.enableMfa.requestToEnableOtp(user.userId)
	}

	@Put(ep.enableOtp)
	async enableOtp(@DtoBody(OtpEnableDto) data: OtpEnableDto): Promise<{ success: true }> {
		await this.enableMfa.enableOtp(data)
		return { success: true }
	}

	@Put(ep.disableOtp)
	async disableOtp(
		@GetUser({ required: true }) user: AuthUser,
		@DtoBody(OtpDisableDto) data: OtpDisableDto,
	): Promise<{ success: true }> {
		await this.enableMfa.disableOtp(user, data.password)
		return { success: true }
	}

	/**
	 */
	@Post(ep.hasMfa)
	async checkMfa(@GetUser({ required: true }) user: AuthUser): Promise<{ enabled: boolean }> {
		return {
			enabled: await this.enableMfa.hasMfa(user),
		}
	}
}
