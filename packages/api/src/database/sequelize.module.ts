import { BootstrapRepoManager } from "@api/database/BootstrapRepoManager"
import { Global, Logger, Module } from "@nestjs/common"
import { systemCollections } from "@zmaj-js/common"
import {
	AlterSchemaService,
	DatabaseConfig,
	SchemaInfoService,
	SequelizeAlterSchemaService,
	SequelizeRepoManager,
	SequelizeSchemaInfoService,
	SequelizeService,
} from "@zmaj-js/orm"

@Global()
@Module({
	providers: [
		{
			provide: SequelizeService,
			inject: [DatabaseConfig],
			useFactory: async (config: DatabaseConfig) => {
				const sqService = new SequelizeService(config, new Logger(SequelizeService.name))
				// we are initializing connection here
				await sqService.initCms(systemCollections)
				return sqService
			},
		},
		{
			provide: BootstrapRepoManager,
			useExisting: SequelizeRepoManager,
		},
		{
			provide: SequelizeRepoManager,
			inject: [SequelizeService],
			useFactory: (sq: SequelizeService) => sq.repoManager,
		},
		{
			provide: SequelizeAlterSchemaService,
			inject: [SequelizeService],
			useFactory: (sq: SequelizeService) => sq.alterSchema,
		},
		{
			provide: SequelizeSchemaInfoService,
			inject: [SequelizeService],
			useFactory: (sq: SequelizeService) => sq.schemaInfo,
		},
		{ provide: AlterSchemaService, useExisting: SequelizeAlterSchemaService },
		{ provide: SchemaInfoService, useExisting: SequelizeSchemaInfoService },
	],
	exports: [
		SequelizeService,
		SequelizeRepoManager,
		BootstrapRepoManager,
		SequelizeSchemaInfoService,
		SequelizeAlterSchemaService,
		AlterSchemaService,
		SchemaInfoService,
	],
})
export class SequelizeModule {}
