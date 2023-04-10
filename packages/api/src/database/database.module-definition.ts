import { ConfigurableModuleBuilder } from "@nestjs/common"
import { DatabaseConfigParams } from "@zmaj-js/orm"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<DatabaseConfigParams>().build()
