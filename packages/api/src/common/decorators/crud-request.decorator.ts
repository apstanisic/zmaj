import { emsg } from "@api/errors"
import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { AuthUser, zodCreate, ZodIdType } from "@zmaj-js/common"
import { Request } from "express"
import { isIP } from "net"
import { throw400, throw500 } from "../throw-http"
import { CrudRequest } from "./crud-request.type"
import { getCollectionFromContext } from "./set-collection.decorator"

/**
 * All data that is needed for services
 * @example
 * someMethod(@GetCrudRequest() req: CrudRequest) {}
 */
export const GetCrudRequest = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): CrudRequest => {
		const request = ctx.switchToHttp().getRequest<Request>()

		const userAgent = request.headers["user-agent"]
		const ip = request.ip
		// Should never happen, but we still check if it's valid IP
		if (isIP(ip) === 0) throw400(90521, emsg.invalidIp)
		// This should be parsed in interceptor, we are just checking here if it's attached to req
		const params = request.parsedParams ?? throw500(9932432)
		const query = request.parsedQuery ?? throw500(362933)
		const body = request.parsedBody ?? throw500(932233)
		const collection = getCollectionFromContext(ctx) ?? params["collection"] ?? throw500(379097)
		const recordId = zodCreate(ZodIdType().optional(), params["id"])
		const user = AuthUser.verify(request.user)

		return { ip, query, userAgent, user, params, body, collection, recordId, isCrudRequest: true }
	},
)
export type { CrudRequest } from "./crud-request.type"

// export const GetCrudRequest2 = createParamDecorator(
// 	<T extends ZodTypeAny>(
// 		DtoClass: ZodDtoClass<T> | undefined,
// 		ctx: ExecutionContext,
// 	): CrudRequest => {
// 		const request = ctx.switchToHttp().getRequest<Request>()

// 		const userAgent = request.headers["user-agent"]
// 		const ip = request.ip
// 		// Should never happen, but we still check if it's valid IP
// 		if (isIP(ip) === 0) throw400(90521)
// 		// This should be parsed in interceptor, we are just checking here if it's attached to req
// 		const params = request.parsedParams ?? throw500(9932432)
// 		const query = request.parsedQuery ?? throw500(362933)
// 		const body = request.parsedBody ?? throw500(932233)
// 		const a = DtoClass ? new DtoClass(request.parsedBody) : undefined
// 		const collection = getCollectionFromContext(ctx) ?? params.collection ?? throw500(379097)
// 		const recordId = zodCreate(ZodIdType().optional(), params.id)
// 		const user = AuthUser.verify(request.user)

// 		return { ip, query, userAgent, user, params, body, collection, recordId }
// 	},
// )
