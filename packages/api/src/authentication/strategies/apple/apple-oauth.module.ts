import { Module } from "@nestjs/common"
import { OidcModule } from "../oidc/oidc.module"
import { AppleOAuthController } from "./apple-oauth.controller"
import { AppleOAuthStrategy } from "./apple-oauth.strategy"

/**
 * We separated this module for reducing complexity in main AuthenticationModule and service
 */
@Module({
	imports: [OidcModule],
	providers: [AppleOAuthStrategy],
	controllers: [AppleOAuthController],
})
export class AppleOAuthModule {}
