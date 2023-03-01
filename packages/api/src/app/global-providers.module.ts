import { BasicAuthGuard } from "@api/authentication/strategies/basic-auth/basic-auth.guard"
import { JwtGuard } from "@api/authentication/strategies/jwt/jwt.guard"
import { AuthorizationGuard } from "@api/authorization/authorization.guard"
import { Global, Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"

/**
 * This must be separate module, since we need to guarantee order of guards (first authn, then authz)
 */
@Global()
@Module({
	providers: [
		{ provide: APP_GUARD, useClass: BasicAuthGuard },
		{ provide: APP_GUARD, useClass: JwtGuard },
		{ provide: APP_GUARD, useClass: AuthorizationGuard },
	],
})
export class GlobalProvidersModule {}
