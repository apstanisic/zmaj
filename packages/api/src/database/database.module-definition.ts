import { ConfigurableModuleBuilder } from "@nestjs/common"
import { DatabaseConfigParams } from "./database.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<DatabaseConfigParams>().build()
