import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { GetCookie } from "@api/common/decorators/get-cookie.decorator"
import { UserAgent } from "@api/common/decorators/user-agent.decorator"
import { Controller, Delete, Ip, Post, Res } from "@nestjs/common"
import { endpoints, REFRESH_COOKIE_NAME, SignInDto } from "@zmaj-js/common"
import type { Response } from "express"
import { AuthenticationService } from "./authentication.service"
import { RefreshTokenService } from "./refresh-token.service"

const ep = endpoints.auth.signIn

@Controller(ep.$base)
export class AuthenticationController {
	constructor(
		private readonly service: AuthenticationService,
		private readonly rtService: RefreshTokenService,
	) {}
	/**
	 * Attempt to login user
	 * Passthrough means that we normally return value, but we have access to Res object
	 */
	@Post(ep.signIn)
	async signIn(
		@DtoBody(SignInDto) dto: SignInDto,
		@Res({ passthrough: true }) response: Response,
		@Ip() ip: string,
		@UserAgent() userAgent?: string,
	): Promise<{ accessToken: string }> {
		const tokens = await this.service.signInWithPassword(dto, { userAgent, ip })
		this.rtService.set(response, tokens.refreshToken)
		return { accessToken: tokens.accessToken }
	}

	@Delete(ep.signOut)
	async signOut(
		@Res({ passthrough: true }) res: Response,
		@GetCookie(REFRESH_COOKIE_NAME) refreshToken?: string,
	): Promise<{ success: true }> {
		if (refreshToken === undefined) return { success: true }

		this.rtService.remove(res)
		//  In case where user removed session manually, but is still logged in,
		await this.service.signOut(refreshToken).catch(() => undefined)

		return { success: true }
	}

	/**
	 * Get new access token
	 */
	@Post(ep.newAccessToken)
	async getNewAccessToken(
		@GetCookie(REFRESH_COOKIE_NAME) refreshToken?: string,
	): Promise<{ accessToken: string }> {
		const accessToken = await this.service.getNewAccessToken(refreshToken)
		return { accessToken }
	}
}
