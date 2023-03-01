import { ConfigurableModuleBuilder } from "@nestjs/common"
import { StorageConfigParams } from "./storage.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<StorageConfigParams>().build()
