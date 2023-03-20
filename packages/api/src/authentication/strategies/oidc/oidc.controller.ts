import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { RefreshTokenService } from "@api/authentication/refresh-token.service"
import { RedirectResponse } from "@api/common"
import { UserAgent } from "@api/common/decorators/user-agent.decorator"
import { throw500 } from "@api/common/throw-http"
import { wrap } from "@api/common/wrap"
import { Controller, Get, Ip, Redirect, Res } from "@nestjs/common"
import { AuthUser, endpoints, type Data, type Struct } from "@zmaj-js/common"
import type { Response } from "express"
import { AuthenticationService } from "../../authentication.service"
import { GetUser } from "../../get-user.decorator"
import { OidcStrategy } from "./oidc.strategy"

const ep = endpoints.auth.oidc

@Controller(ep.$base)
export class OidcController {
	constructor(
		private auth: AuthenticationService,
		private config: GlobalConfig,
		private oidcStrategy: OidcStrategy,
		private authConfig: AuthenticationConfig,
		private rtService: RefreshTokenService,
	) {}

	/**
	 * This method will never be called because we have middleware in module that
	 * intercepts this and sends it to OIDC provider for login
	 */
	@Get(ep.redirectToProviderLogin)
	async redirectToProviderLogin(): Promise<never> {
		throw500(50123)
	}

	@Redirect()
	@Get(ep.callback)
	async openIdCallback(
		@Res({ passthrough: true }) res: Response,
		@GetUser({ required: true }) user: AuthUser,
		@Ip() ip: string,
		@UserAgent() userAgent?: string,
	): Promise<RedirectResponse> {
		const { refreshToken } = await this.auth.createAuthSession(user, { ip, userAgent })

		this.rtService.set(res, refreshToken)

		return {
			url: this.authConfig.fullSignInRedirectPath,
			statusCode: 303,
		}
	}

	@Get(ep.getProviders)
	getAllProviders(): Data<Struct<{ url: string }>> {
		return wrap(this.oidcStrategy.clientsAndUrls)
	}
}
