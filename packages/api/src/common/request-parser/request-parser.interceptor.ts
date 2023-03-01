import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Request } from "express"
import { Observable } from "rxjs"
import { ValidBodySchema, ValidParamsSchema, ValidQuerySchema } from "./parsed-request.schemas"

/**
 * Parse request
 *
 * It parses body (it hydrates dates), params (just in case)
 * and query (full validation with lots of defined values)
 */
@Injectable()
export class RequestParserInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const req = context.switchToHttp().getRequest<Request>()

		req.parsedBody = ValidBodySchema.parse(req.body)
		req.parsedQuery = ValidQuerySchema.parse(req.query)
		req.parsedParams = ValidParamsSchema.parse(req.params)

		return next.handle()
	}
}
