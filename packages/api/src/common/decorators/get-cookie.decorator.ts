import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { Request } from "express"
import { z } from "zod"

export const CookiesSchema = z.record(z.preprocess((v) => String(v), z.string())).default({})
/**
 * Get single cookie
 */
function getCookie(cookieName: string, ctx: ExecutionContext): string | undefined {
	const request = ctx.switchToHttp().getRequest<Request>()
	const cookie = request.signedCookies[cookieName] ?? request.cookies[cookieName]
	// if cookie is tempered, it will be `false`, so we have to check for type string
	if (typeof cookie === "string") return cookie
	return
}

/**
 * Get cookie by name
 */
export const GetCookie = createParamDecorator(getCookie)
