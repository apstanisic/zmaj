import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { SignUpService } from "@api/authentication/sign-up/sign-up.service"
import { OidcConfig } from "@api/authentication/strategies/oidc/oidc.config"
import { throw403 } from "@api/common/throw-http"
import { EmailService } from "@api/email/email.service"
import { emsg } from "@api/errors"
import { Controller, Get } from "@nestjs/common"
import { Data, PublicAuthData } from "@zmaj-js/common"
import { InitializeAdminService } from "../authentication/initialize-admin/initialize-admin.service"

/**
 * Admin panel needs some info to be provided, so it can show proper pages/ui.
 */
@Controller("admin-panel-wip")
export class AdminPanelInfoController {
	constructor(
		private authConfig: AuthenticationConfig,
		private signUpService: SignUpService,
		private adminInited: InitializeAdminService,
		private config: GlobalConfig,
		private emailService: EmailService,
		private oidcConfig: OidcConfig,
	) {}

	@Get("auth")
	async getPublicAuthData(): Promise<Data<PublicAuthData>> {
		if (!this.authConfig.exposePublicInfo) throw403(379995, emsg.noAuthz)

		const info = {
			signUpAllowed: await this.signUpService.isSignUpAllowed(),
			oidc: this.oidcConfig.providers.map((pr) => ({
				name: pr.name,
				url: this.config.joinWithApiUrl(`/auth/oidc/${pr.name}/login`),
			})),
			magicLink: this.emailService.enabled,
			// adminInitialized: await this.adminInited.isAdminInitialized(),
			resetPasswordAllowed: this.authConfig.passwordReset === "reset-email",
			requireEmailConfirmation: this.authConfig.requireEmailConfirmation,
			oauth: this.authConfig.allowOAuthSignUp
				? {
						// apple: this.authConfig.oauth.apple !== undefined,
						apple: false,
						google: this.authConfig.oauth.google !== undefined,
						facebook: this.authConfig.oauth.facebook !== undefined,
				  }
				: undefined,
		}
		return { data: info }
	}
}
