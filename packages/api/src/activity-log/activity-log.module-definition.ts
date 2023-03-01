import { ConfigurableModuleBuilder } from "@nestjs/common"
import { ActivityLogConfigParams } from "./activity-log.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<ActivityLogConfigParams>().build()
