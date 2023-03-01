import { throw403 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { CanActivate, ExecutionContext, Injectable, UseGuards } from "@nestjs/common"
import { ADMIN_ROLE_ID, AuthUser } from "@zmaj-js/common"
import { Request } from "express"

@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest<Request>()
		if (req.user instanceof AuthUser && req.user.roleId === ADMIN_ROLE_ID) return true
		throw403(5923453, emsg.noAuthz)
	}
}

export const MustBeAdmin = (): MethodDecorator & ClassDecorator => UseGuards(AdminGuard)
