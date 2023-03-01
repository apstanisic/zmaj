import { ExceptionTransformer } from "@api/common/exception.transformer"
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { ZodError } from "zod"
import { ValidationException } from "./validation.exception"

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly transformer: ExceptionTransformer,
	) {}

	catch(exception: ZodError, host: ArgumentsHost): void {
		const httpError = new ValidationException(exception)
		const errResponse = this.transformer.handle(
			httpError.getStatus(),
			httpError.getResponse(),
			httpError,
		)

		this.httpAdapterHost.httpAdapter.reply(
			host.switchToHttp().getResponse(),
			errResponse,
			errResponse.error.statusCode,
		)
	}
}
