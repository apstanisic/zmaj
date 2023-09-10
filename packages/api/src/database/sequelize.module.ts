import { BootstrapRepoManager } from "@api/database/BootstrapRepoManager"
import { Global, Module } from "@nestjs/common"
import { systemModels } from "@zmaj-js/common"
import { AlterSchemaService, Orm, SchemaInfoService } from "@zmaj-js/orm"
import {
	SequelizeAlterSchemaService,
	SequelizeRepoManager,
	SequelizeSchemaInfoService,
	SequelizeService,
	sqOrmEngine,
} from "@zmaj-js/orm-sq"
import { DatabaseConfig } from "./database.config"

@Global()
@Module({
	providers: [
		{
			provide: Orm,
			inject: [DatabaseConfig],
			useFactory: async (config: DatabaseConfig) => {
				const orm = new Orm({ config, engine: sqOrmEngine, models: [...systemModels] })
				await orm.init()
			},
		},
		{
			provide: SequelizeService,
			inject: [Orm],
			useFactory: async (orm: Orm) => {
				return orm.engine.engineProvider as SequelizeService
			},
		},
		{
			provide: SequelizeRepoManager,
			inject: [Orm],
			useFactory: (orm: Orm) => orm.repoManager,
		},
		{
			provide: SequelizeAlterSchemaService,
			inject: [Orm],
			useFactory: (orm: Orm) => orm.alterSchema,
		},
		{
			provide: SequelizeSchemaInfoService,
			inject: [Orm],
			useFactory: (orm: Orm) => orm.schemaInfo,
		},
	],
	exports: [BootstrapRepoManager, AlterSchemaService, SchemaInfoService],
})
export class SequelizeModule {}
