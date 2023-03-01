import { throw401, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { isBoolean, isNil } from "@zmaj-js/common"
import { Request } from "express"
// import { Request } from "express"
// import { firstValueFrom, Observable } from "rxjs"

/**
 * Use only when jwt auth is required. For general auth use CombinedGuard
 */
@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
	override async canActivate(context: ExecutionContext): Promise<boolean> {
		const req: Request = context.switchToHttp().getRequest()
		const authHeader = req.headers["authorization"] ?? "none"
		const accessTokenInQuery = req.query["accessToken"]

		// don't activate if there is no Bearer auth header or accessToken in query
		if (!authHeader.startsWith("Bearer ") && isNil(accessTokenInQuery)) return true

		// do not check if token is valid if it's sign out
		if (req.url === "/auth/sign-out") return true

		try {
			const allowed = await super.canActivate(context)
			if (!isBoolean(allowed)) throw500(7329432)
			if (!allowed) throw401(482398, emsg.jwtInvalid)
		} catch (error) {
			// rethrow if `canActivate` throws, since it throws without error code
			throw401(378293, emsg.jwtInvalid)
		}
		return true
	}
}
