import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { AuthenticationService } from "@api/authentication/authentication.service"
import { GetUser } from "@api/authentication/get-user.decorator"
import { RefreshTokenService } from "@api/authentication/refresh-token.service"
import { RedirectResponse } from "@api/common"
import { UserAgent } from "@api/common/decorators/user-agent.decorator"
import { Controller, Get, Ip, Redirect, Res, UseGuards } from "@nestjs/common"
import { AuthUser, endpoints } from "@zmaj-js/common"
import type { Response } from "express"
import { GoogleOAuthGuard } from "./google-oauth.guard"
import { throw500 } from "@api/common/throw-http"

const ep = endpoints.auth.oauth.google

@Controller(ep.$base)
export class GoogleOAuthController {
	constructor(
		private auth: AuthenticationService,
		private authConfig: AuthenticationConfig,
		private rtService: RefreshTokenService,
	) {}

	/**
	 * This will redirect to login
	 */
	@Get(ep.signIn)
	@UseGuards(GoogleOAuthGuard)
	async login(): Promise<void> {
		throw500(12381)
	}

	@Redirect()
	@Get(ep.callback)
	@UseGuards(GoogleOAuthGuard)
	async googleAuthRedirect(
		@Res({ passthrough: true }) res: Response,
		@GetUser({ required: true }) user: AuthUser,
		@Ip() ip: string,
		@UserAgent() userAgent?: string,
	): Promise<RedirectResponse> {
		const { refreshToken } = await this.auth.createAuthSession(user, {
			ip,
			userAgent,
		})

		this.rtService.set(res, refreshToken)

		return {
			url: this.authConfig.fullSignInRedirectPath,
			statusCode: 303,
		}
	}
}
