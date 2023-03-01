import { throw404 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Global, MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { Request } from "express"
import passport from "passport"
import { OidcConfig } from "./oidc.config"
import { OidcController } from "./oidc.controller"
import { OidcStrategy } from "./oidc.strategy"

/**
 * We separated this module for reducing complexity in main AuthenticationModule and service
 */
@Global()
@Module({
	providers: [OidcStrategy, OidcConfig],
	controllers: [OidcController],
	exports: [OidcConfig],
})
export class OidcModule implements NestModule {
	constructor(private config: OidcConfig) {}

	/**
	 * Middleware for OIDC auth because we need to dynamically authenticate user
	 * depending on url (we accept provider name as param)
	 */
	configure(consumer: MiddlewareConsumer): void {
		consumer
			.apply((req: Request, res: unknown, next: () => unknown) => {
				if (req.url.includes("oidc-providers")) return next()

				const provider =
					this.config.providers.find((p) => p.name === req.params["provider"]) ??
					throw404(593279432, emsg.oauthNotEnabled)

				const passportMiddleware = passport.authenticate(provider.name, { session: true })

				passportMiddleware(req, res, next)
			})
			.forRoutes(OidcController)
	}
}
