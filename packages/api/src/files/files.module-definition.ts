import { ConfigurableModuleBuilder } from "@nestjs/common"
import { FilesConfigParams } from "./files.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<FilesConfigParams>().build()
