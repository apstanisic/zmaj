import { ConfigurableModuleBuilder } from "@nestjs/common"
import { ConfigModuleParams } from "./config.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<ConfigModuleParams>().build()
