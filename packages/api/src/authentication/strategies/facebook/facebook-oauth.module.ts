import { Module } from "@nestjs/common"
import { OidcModule } from "../oidc/oidc.module"
import { FacebookOAuthController } from "./facebook-oauth.controller"
import { FacebookOAuthStrategy } from "./facebook-oauth.strategy"

/**
 * We separated this module for reducing complexity in main AuthenticationModule and service
 */
@Module({
	imports: [OidcModule],
	providers: [FacebookOAuthStrategy],
	controllers: [FacebookOAuthController],
})
export class FacebookOAuthModule {}
