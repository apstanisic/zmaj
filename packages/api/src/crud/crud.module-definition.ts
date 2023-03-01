import { ConfigurableModuleBuilder } from "@nestjs/common"
import { CrudConfigParams } from "./crud.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<CrudConfigParams>().build()
