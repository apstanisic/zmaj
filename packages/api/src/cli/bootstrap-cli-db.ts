import { GlobalConfig } from "@api/app/global-app.config"
import { ConfigModuleConfig } from "@api/config/config.config"
import { DatabaseConfig } from "@api/database/database.config"
import { SequelizeModule } from "@api/sequelize/sequelize.module"
import { DynamicModule, Module } from "@nestjs/common"
import { ConfigService } from ".."
import { MODULE_OPTIONS_TOKEN } from "../database/database.module-definition"

@Module({})
export class CliDbModule {
	static forRoot(envPath: string): DynamicModule {
		return {
			module: CliDbModule,
			global: true,
			imports: [SequelizeModule],
			exports: [MODULE_OPTIONS_TOKEN, ConfigModuleConfig, DatabaseConfig, GlobalConfig],
			providers: [
				{ provide: MODULE_OPTIONS_TOKEN, useFactory: () => ({}) },
				{
					provide: GlobalConfig,
					inject: [ConfigService],
					useFactory: (cs: ConfigService) => new GlobalConfig({}, cs),
				},
				ConfigService,
				{
					provide: DatabaseConfig,
					inject: [ConfigService],
					useFactory: (cs: ConfigService) => new DatabaseConfig({}, cs),
				},
				{
					provide: ConfigModuleConfig,
					useValue: {
						envPath,
						assignToProcessEnv: false,
						throwOnNoEnvFile: true,
						useEnvFile: true,
						useProcessEnv: true,
					},
				},
			],
		}
	}
}
