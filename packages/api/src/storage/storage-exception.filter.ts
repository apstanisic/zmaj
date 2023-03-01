import { ExceptionTransformer } from "@api/common/exception.transformer"
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { StorageError } from "@zmaj-js/storage-core"

@Catch(StorageError)
export class StorageExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly transformer: ExceptionTransformer,
	) {}

	catch(exception: StorageError, host: ArgumentsHost): void {
		const errResponse = this.transformer.handleTyped(
			500,
			{ message: exception.message, errorCode: 95811 },
			exception,
		)

		this.httpAdapterHost.httpAdapter.reply(
			host.switchToHttp().getResponse(),
			errResponse,
			errResponse.error.statusCode,
		)
	}
}
