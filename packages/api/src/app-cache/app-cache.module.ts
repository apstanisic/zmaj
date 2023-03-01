import { CacheModule, Global, Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { millisecondsToSeconds } from "date-fns"
import { AppCacheInterceptor } from "./app-cache.interceptor"
import { CacheConfig } from "./cache.config"
import { ConfigurableModuleClass } from "./cache.module-definition"

@Global()
@Module({
	imports: [
		CacheModule.register({
			isGlobal: true,
			inject: [CacheConfig],
			useFactory: (config: CacheConfig) => ({
				max: 100,
				store: config.type,
				ttl: millisecondsToSeconds(config.ttlMs),
			}),
		}),
	],
	providers: [{ provide: APP_INTERCEPTOR, useClass: AppCacheInterceptor }, CacheConfig],
	exports: [CacheConfig],
})
export class AppCacheModule extends ConfigurableModuleClass {}
