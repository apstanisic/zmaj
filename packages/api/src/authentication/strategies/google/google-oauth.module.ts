import { Module } from "@nestjs/common"
import { OidcModule } from "../oidc/oidc.module"
import { GoogleOAuthController } from "./google-oauth.controller"
import { GoogleOAuthStrategy } from "./google-oauth.strategy"

/**
 * We separated this module for reducing complexity in main AuthenticationModule and service
 */
@Module({
	imports: [OidcModule],
	providers: [GoogleOAuthStrategy],
	controllers: [GoogleOAuthController],
})
export class GoogleOAuthModule {}
