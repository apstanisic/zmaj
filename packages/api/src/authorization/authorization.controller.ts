import { GetUser } from "@api/authentication/get-user.decorator"
import { ParseStringPipe } from "@api/common/parse-string.pipe"
import { Controller, Get, Param } from "@nestjs/common"
import { AuthUser, endpoints } from "@zmaj-js/common"
import { AuthorizationConfig } from "./authorization.config"
import { AuthorizationService } from "./authorization.service"

const ep = endpoints.authz

/**
 * @deprecated Should be moved under `/api/admin-panel`
 */
@Controller(ep.$base)
export class AuthorizationController {
	constructor(
		private readonly service: AuthorizationService,
		private readonly config: AuthorizationConfig,
	) {}

	/**
	 * Not exposed currently, see in the future if there is a need
	 */
	@Get(ep.isAllowed)
	isAllowed(
		@Param("action", ParseStringPipe) action: string,
		@Param("resource", ParseStringPipe) resource: string,
		@GetUser() user?: AuthUser,
	): { allowed: boolean } {
		// always return true if we can't expose info
		if (!this.config.exposeAllowedPermissions) return { allowed: false }
		const canUseThisEndpoint = this.service.checkSystem("adminPanel", "access", { user })
		if (!canUseThisEndpoint) return { allowed: false }

		const allowed = this.service.check({ user, resource, action })
		return { allowed }
	}
}
