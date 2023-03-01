import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { filterStruct, Struct, zodCreate } from "@zmaj-js/common"
import { Request } from "express"
import { CookiesSchema } from "./get-cookie.decorator"

/**
 * Get all cookies
 */
function getAllCookies(params: unknown, ctx: ExecutionContext): Struct<string> {
	const request = ctx.switchToHttp().getRequest<Request>()

	const normal = request.cookies
	// invalid signed cookies will have value false, (that happens when we change secret key)
	// or can be json. We do not want invalid cookies
	const signed = filterStruct(request.signedCookies, (v) => typeof v === "string")

	return zodCreate(CookiesSchema, { ...normal, ...signed })
}

/**
 * Get all cookies
 */
export const GetCookies = createParamDecorator(getAllCookies)
