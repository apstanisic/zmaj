import { throw401 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { AuthUser } from "@zmaj-js/common"
import { Request } from "express"

/**
 * Get logged user from request
 *
 * @example
 * ```js
 * controllerMethod(@GetUser() user?: User)
 * ```
 * @example
 * This will throw error if user does not exist
 * ```js
 * controllerMethod(@GetUser({ required: true }) user: User)
 * ```
 */
export const GetUser = createParamDecorator(
	(options: { required?: boolean } = {}, ctx: ExecutionContext): AuthUser | undefined => {
		const user = ctx.switchToHttp().getRequest<Request>().user
		if (user instanceof AuthUser) return user

		if (options.required) throw401(7665, emsg.authRequired)
		return undefined
	},
)
