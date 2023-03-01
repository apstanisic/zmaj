import { ConfigurableModuleBuilder } from "@nestjs/common"
import { RedisConfigParams } from "./redis.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<RedisConfigParams>().build()
