import { ConfigurableModuleBuilder } from "@nestjs/common"
import { MigrationsConfigParams } from "./migrations.config"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<MigrationsConfigParams>().build()
