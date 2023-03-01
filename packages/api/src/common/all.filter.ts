import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { ExceptionTransformer } from "./exception.transformer"

/**
 * Not used currently
 */
@Catch(Error)
export class MyFilter implements ExceptionFilter {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private transformer: ExceptionTransformer,
	) {}

	logger = new Logger("ExceptionFilter")

	catch(exception: Error, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost

		console.log("SOMETHING WRONG!!!!")
		console.log({ isHttp: exception instanceof HttpException, exception })

		const ctx = host.switchToHttp()

		httpAdapter.reply(ctx.getResponse(), { code: 34234 }, 500)
	}
}
