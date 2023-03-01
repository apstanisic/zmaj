import { ConfigurableModuleBuilder } from "@nestjs/common"
import { AuthenticationConfigParams } from "./authentication.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<AuthenticationConfigParams>().build()
