import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { GetUser } from "@api/authentication/get-user.decorator"
import { SignUpService } from "@api/authentication/sign-up/sign-up.service"
import { OidcConfig } from "@api/authentication/strategies/oidc/oidc.config"
import { AuthorizationConfig } from "@api/authorization/authorization.config"
import { throw403 } from "@api/common/throw-http"
import { EmailService } from "@api/email/email.service"
import { emsg } from "@api/errors"
import { Controller, Get } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	AllowedAction,
	AuthUser,
	PublicAuthData,
	castArray,
	type Data,
} from "@zmaj-js/common"
import { AuthorizationService } from ".."
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
		private authzService: AuthorizationService,
		private authzConfig: AuthorizationConfig,
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

	@Get("auth/allowed-actions")
	getAllowedActions(@GetUser({ required: true }) user: AuthUser): Data<AllowedAction[] | null> {
		const rules = this.authzService.getRules({ user })

		const empty = { data: [] }
		// this prevents user from knowing it's permissions and server config
		if (!this.authzConfig.exposeAllowedPermissions) return empty
		// if (!this.config.exposeAllowedPermissions) throw403(529378423)

		// this prevents user from knowing it's permissions
		const allowed = this.authzService.checkSystem("adminPanel", "access", { user })
		if (!allowed) return empty

		// Admin can do anything
		if (user?.roleId === ADMIN_ROLE_ID) return { data: null }

		// this.checkSystem("account", "readPermissions", { user }) || throw403(89234)

		const info = rules.rules.map((rule) => ({
			action: rule.action,
			fields: rule.fields === undefined ? null : castArray(rule.fields),
			resource: rule.subject,
		}))
		return { data: info }
	}
}
