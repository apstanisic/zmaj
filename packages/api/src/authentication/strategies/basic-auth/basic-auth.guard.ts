import { throw401, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { isBoolean } from "@zmaj-js/common"
import { Request } from "express"

/**
 * Use only when basic auth is required. For general auth use CombinedGuard
 */
@Injectable()
export class BasicAuthGuard extends AuthGuard("basic") {
	override async canActivate(context: ExecutionContext): Promise<boolean> {
		const req: Request = context.switchToHttp().getRequest()
		const authzHeader = req.headers["authorization"] ?? "none"
		// don't activate if there is no Basic auth header
		if (!authzHeader.startsWith("Basic ")) return true

		const allowed = await super.canActivate(context)

		if (!isBoolean(allowed)) throw500(7329432)
		if (!allowed) throw401(482398, emsg.invalidEmailOrPassword)
		return true
	}
}
