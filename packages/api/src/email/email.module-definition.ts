import { ConfigurableModuleBuilder } from "@nestjs/common"
import { EmailConfigParams } from "./email.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<EmailConfigParams>().build()
