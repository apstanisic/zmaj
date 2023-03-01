import { Global, Module } from "@nestjs/common"
import { ConfigModuleConfig } from "./config.config"
import { ConfigurableModuleClass } from "./config.module-definition"
import { ConfigService } from "./config.service"

@Global()
@Module({
	providers: [ConfigService, ConfigModuleConfig],
	exports: [ConfigService],
})
export class AppConfigModule extends ConfigurableModuleClass {}
