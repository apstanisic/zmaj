import { BootstrapOrm } from "@api/database/BootstrapOrm"
import { Global, Module } from "@nestjs/common"
import { systemModels } from "@zmaj-js/common"
import { AlterSchemaService, Orm, SchemaInfoService } from "@zmaj-js/orm"
import { SequelizeService, snakeCaseNaming, sqOrmEngine } from "@zmaj-js/orm-sq"
import { DatabaseConfig } from "./database.config"

@Global()
@Module({
	providers: [
		{
			provide: BootstrapOrm,
			inject: [DatabaseConfig],
			useFactory: async (config: DatabaseConfig) => {
				const orm = new Orm({
					config,
					engine: sqOrmEngine,
					models: [...systemModels],
					naming: snakeCaseNaming,
				})
				await orm.init()
				return orm
			},
		},
		{
			provide: SequelizeService,
			inject: [BootstrapOrm],
			useFactory: async (orm: Orm) => {
				return orm.engine.engineProvider as SequelizeService
			},
		},
		{
			provide: AlterSchemaService,
			inject: [BootstrapOrm],
			useFactory: (orm: Orm) => orm.alterSchema,
		},
		{
			provide: SchemaInfoService,
			inject: [BootstrapOrm],
			useFactory: (orm: Orm) => orm.schemaInfo,
		},
	],
	exports: [BootstrapOrm, AlterSchemaService, SchemaInfoService, SequelizeService],
})
export class SequelizeModule {}
