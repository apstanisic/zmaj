import { Global, Module } from "@nestjs/common"
import { DatabaseConfig, DatabaseConfigParams } from "@zmaj-js/orm"
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from "./database.module-definition"
import { ConfigService } from "../config/config.service"
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
