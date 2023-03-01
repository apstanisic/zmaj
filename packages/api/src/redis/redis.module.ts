import { Global, Module } from "@nestjs/common"
import { RedisConfig } from "./redis.config"
import { ConfigurableModuleClass } from "./redis.module-definition"
import { RedisService } from "./redis.service"

@Global()
@Module({
	providers: [RedisService, RedisConfig],
	exports: [RedisService],
})
export class RedisModule extends ConfigurableModuleClass {}
