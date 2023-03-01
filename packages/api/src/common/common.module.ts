import { HttpExceptionFilter } from "@api/common/http-exception.filter"
import { Global, Module } from "@nestjs/common"
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core"
import { ExceptionTransformer } from "./exception.transformer"
import { ParseStringPipe } from "./parse-string.pipe"
import { RequestParserInterceptor } from "./request-parser/request-parser.interceptor"
import { ZodExceptionFilter } from "./validation/zod-exception.filter"

@Global()
@Module({
	providers: [
		ExceptionTransformer,
		{ provide: APP_INTERCEPTOR, useClass: RequestParserInterceptor },
		{ provide: APP_FILTER, useClass: ZodExceptionFilter },
		{ provide: APP_FILTER, useClass: HttpExceptionFilter },
		// { provide: APP_FILTER, useClass: MyFilter },
		ParseStringPipe,
	],
	exports: [ParseStringPipe, ExceptionTransformer],
})
export class CommonModule {}
