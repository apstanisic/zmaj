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
import { UsersMfaService } from "./users-mfa.service"

const ep = endpoints.auth.mfa

@Controller(ep.$base)
export class MfaController {
	constructor(private enableMfa: UsersMfaService) {}

	@Get(ep.requestToEnableOtp)
	async requestOtpEnable(
		@GetUser({ required: true }) user: AuthUser,
	): Promise<{ image: string; secret: string; jwt: string; backupCodes: string[] }> {
		return this.enableMfa.requestToEnableOtp(user)
	}

	@Put(ep.enableOtp)
	async enableOtp(
		@GetUser({ required: true }) user: AuthUser,
		@DtoBody(OtpEnableDto) data: OtpEnableDto,
	): Promise<{ success: true }> {
		await this.enableMfa.enableOtp({ user, code: data.code, jwt: data.jwt })
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
	 * Get new access token
	 */
	@Post(ep.hasMfa)
	async checkMfa(
		@DtoBody(StructDto) dto: StructDto,
		@GetUser() user?: AuthUser,
	): Promise<{ enabled: boolean }> {
		if (user) {
			return {
				enabled: await this.enableMfa.authUserHasMfa(user),
			}
		} else {
			return {
				enabled: await this.enableMfa.hasMfa(SignInDto.fromUnknown(dto)),
			}
		}
	}
}
