import { Global, Module } from "@nestjs/common"
import { ConfigService } from "../config/config.service"
import { DatabaseConfig, DatabaseConfigParams } from "./database.config"
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from "./database.module-definition"
import { SequelizeModule } from "./sequelize.module"

/**
 * Database module
 */
@Global()
@Module({
	imports: [SequelizeModule],
	providers: [
		{
			provide: DatabaseConfig,
			inject: [MODULE_OPTIONS_TOKEN, ConfigService],
			useFactory: (params: DatabaseConfigParams, config: ConfigService) =>
				new DatabaseConfig(params, config),
		},
	],
	exports: [DatabaseConfig],
})
export class DatabaseModule extends ConfigurableModuleClass {}
