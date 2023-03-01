import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { ExceptionTransformer } from "./exception.transformer"

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly transformer: ExceptionTransformer,
	) {}

	logger = new Logger("ExceptionFilter")

	catch(exception: HttpException, host: ArgumentsHost): void {
		const errResponse = this.transformer.handle(
			exception.getStatus(),
			exception.getResponse(),
			exception,
		)

		this.httpAdapterHost.httpAdapter.reply(
			host.switchToHttp().getResponse(),
			errResponse,
			errResponse.error.statusCode,
		)
	}
}
