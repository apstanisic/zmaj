import { ConfigurableModuleBuilder } from "@nestjs/common"
import { InfraConfigParams } from "./infra.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<InfraConfigParams>().build()
