import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { AuthenticationService } from "@api/authentication/authentication.service"
import { GetUser } from "@api/authentication/get-user.decorator"
import { RefreshTokenService } from "@api/authentication/refresh-token.service"
import { UserAgent } from "@api/common/decorators/user-agent.decorator"
import { Controller, Get, InternalServerErrorException, Ip, Res, UseGuards } from "@nestjs/common"
import { AuthUser, endpoints } from "@zmaj-js/common"
import type { Response } from "express"
import { AppleOAuthGuard } from "./apple-oauth.guard"

const ep = endpoints.auth.oauth.apple

@Controller(ep.$base)
export class AppleOAuthController {
	constructor(
		private auth: AuthenticationService,
		private authConfig: AuthenticationConfig,
		private rtService: RefreshTokenService,
	) {}

	/**
	 * This will redirect to login
	 */
	@Get(ep.signIn)
	@UseGuards(AppleOAuthGuard)
	async login(): Promise<void> {
		throw new InternalServerErrorException(12381)
	}

	@Get(ep.callback)
	@UseGuards(AppleOAuthGuard)
	async AppleAuthRedirect(
		@GetUser({ required: true }) user: AuthUser,
		@Res() res: Response,
		@Ip() ip: string,
		@UserAgent() userAgent?: string,
	): Promise<void> {
		const { refreshToken } = await this.auth.createAuthSession(user, { ip, userAgent })

		this.rtService.set(res, refreshToken)

		res.redirect(303, this.authConfig.fullSignInRedirectPath)
	}
}
