import { ConfigurableModuleBuilder } from "@nestjs/common"
import { AuthorizationParams } from "./authorization.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<AuthorizationParams>().build()
