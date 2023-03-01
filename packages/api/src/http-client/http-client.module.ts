import { Global, Module } from "@nestjs/common"
import { HttpClient } from "./http-client.service"

/**
 * Simple wrapper that allows global
 * (HttpModule does not have global, we have to import everywhere)
 */
@Global()
@Module({
	providers: [HttpClient],
	exports: [HttpClient],
})
export class HttpClientModule {}
