import { GetUser } from "@api/authentication/get-user.decorator"
import { ParseStringPipe } from "@api/common/parse-string.pipe"
import { wrap } from "@api/common/wrap"
import { Controller, Get, Param } from "@nestjs/common"
import { AllowedAction, AuthUser, endpoints, type Data } from "@zmaj-js/common"
import { AuthorizationConfig } from "./authorization.config"
import { AuthorizationService } from "./authorization.service"

const ep = endpoints.authz

@Controller(ep.$base)
export class AuthorizationController {
	constructor(
		private readonly service: AuthorizationService,
		private readonly config: AuthorizationConfig,
	) {}

	/**
	 *
	 * @param user Logged in user
	 * @returns Partial permission with info about what user can do
	 */
	@Get(ep.getPermissions)
	getPermittedActions(@GetUser() user?: AuthUser): Data<AllowedAction[] | null> {
		return wrap(this.service.getAllowedActions(user))
	}

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
