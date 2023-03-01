import { ConfigurableModuleBuilder } from "@nestjs/common"
import { CacheConfigParams } from "./cache.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<CacheConfigParams>().build()
