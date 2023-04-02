import { ConfigurableModuleBuilder } from "@nestjs/common"
import { InfraParams } from "./infra.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<InfraParams>().build()
