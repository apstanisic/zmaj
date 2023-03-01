import { GlobalConfig } from "@api/app/global-app.config"
import { Global, Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { AuthenticationConfig } from "../authentication.config"
import { BasicAuthStrategy } from "./basic-auth/basic-auth.strategy"
import { FacebookOAuthModule } from "./facebook/facebook-oauth.module"
import { GoogleOAuthModule } from "./google/google-oauth.module"
import { JwtStrategy } from "./jwt/jwt.strategy"
import { MagicLinkModule } from "./magic-link/magic-link.module"
import { OidcModule } from "./oidc/oidc.module"

@Global()
@Module({
	imports: [
		JwtModule.registerAsync({
			inject: [AuthenticationConfig, GlobalConfig],
			useFactory: async (authConfig: AuthenticationConfig, globalConfig: GlobalConfig) => ({
				secret: globalConfig.secretKey,
				signOptions: { expiresIn: authConfig.accessTokenTtlMs / 1000 },
			}),
		}),
		GoogleOAuthModule,
		FacebookOAuthModule,
		MagicLinkModule,
		OidcModule,
	],
	exports: [JwtModule],
	providers: [
		BasicAuthStrategy,
		// Export JwtModule so we can use it anywhere
		JwtStrategy,
		// { provide: APP_GUARD, useClass: BasicAuthGuard },
		// { provide: APP_GUARD, useClass: JwtGuard },
	],
})
export class StrategiesModule {}
