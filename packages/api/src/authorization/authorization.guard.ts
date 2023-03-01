import { throw403, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { AuthUser } from "@zmaj-js/common"
import { Request } from "express"
import { Observable } from "rxjs"
import { AuthorizationService } from "./authorization.service"

export type AuthzParams = { action?: string; resource: string; field?: string }

/**
 * This is global guard that is activated if user sets metadata with `SetPermission` or with
 * `SetSystemPermission`. There is no need to use this guard manually
 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly authz: AuthorizationService,
	) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const params = this.reflector.getAllAndOverride<AuthzParams>("authz", [
			context.getHandler(),
			context.getClass(),
		])

		if (!params) return true

		const req = context.switchToHttp().getRequest<Request>()
		const allowed = this.authz.check({
			action: params.action ?? this.getActionFromHttpMethod(req.method),
			resource: params.resource,
			field: params.field,
			user: AuthUser.verify(req.user),
		})

		// this way we throw our exception, and we have code to track errors
		if (!allowed) throw403(925219, emsg.noAuthz)

		return allowed
	}

	/**
	 * It is allowed for controller to don't declare action, in that case we will default
	 * to permission based on HTTP Method
	 *
	 * @param httpMethod HTTP Method
	 * @returns Action that is used for permissions
	 */
	private getActionFromHttpMethod(httpMethod: string): string {
		const method = httpMethod.toLowerCase()
		switch (method) {
			case "get":
				return "read"
			case "post":
				return "create"
			case "delete":
				return "delete"
			case "put":
			case "patch":
				return "update"
			default:
				throw500(94712412)
		}
	}
}
