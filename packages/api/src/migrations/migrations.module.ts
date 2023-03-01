import { Global, Module } from "@nestjs/common"
import { MigrationsConfig } from "./migrations.config"
import { MIGRATIONS_FINISHED } from "./migrations.consts"
import { ConfigurableModuleClass } from "./migrations.module-definition"
import { MigrationsService } from "./migrations.service"
import { MigrationsUmzugStorage } from "./migrations.umzug-storage"

@Global()
@Module({
	providers: [
		MigrationsUmzugStorage,
		MigrationsService,
		MigrationsConfig,
		{
			provide: MIGRATIONS_FINISHED,
			inject: [MigrationsService],
			async useFactory(service: MigrationsService) {
				await service.sync()
				return true
			},
		},
	],
	exports: [MIGRATIONS_FINISHED, MigrationsService, MigrationsConfig],
})
export class MigrationsModule extends ConfigurableModuleClass {}
