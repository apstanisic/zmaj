import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { Request } from "express"

/**
 * @example
 * someMethod(@UsrAgent() ua?: string) {}
 */
export const UserAgent = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): string | undefined => {
		const request = ctx.switchToHttp().getRequest<Request>()
		const userAgent = request.headers["user-agent"]
		return userAgent
	},
)
