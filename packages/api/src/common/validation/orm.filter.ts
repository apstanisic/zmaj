import { ExceptionTransformer } from "@api/common/exception.transformer"
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { ZmajOrmError } from "@zmaj-js/orm"

@Catch(ZmajOrmError)
export class OrmExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly transformer: ExceptionTransformer,
	) {}

	catch(exception: ZmajOrmError, host: ArgumentsHost): void {
		// const httpError = new ValidationException(exception)
		const errResponse = this.transformer.handle(
			exception.httpCode,
			{ message: exception.message },
			exception,
		)

		this.httpAdapterHost.httpAdapter.reply(
			host.switchToHttp().getResponse(),
			errResponse,
			errResponse.error.statusCode,
		)
	}
}
