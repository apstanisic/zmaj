import { DatabaseConfig } from "@api/database/database.config"
import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { Global, Module } from "@nestjs/common"
import { systemCollections } from "@zmaj-js/common"
import { SequelizeRepoManager } from "./sequelize.repo-manager"
import { SequelizeService } from "./sequelize.service"
import { SequelizeAlterSchemaService } from "./sequelize-alter-schema.service"
import { SequelizeSchemaInfoService } from "./sequelize-schema-info.service"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"

export { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"

@Global()
@Module({
	providers: [
		{
			provide: SequelizeService,
			inject: [DatabaseConfig],
			useFactory: async (config: DatabaseConfig) => {
				const sqService = new SequelizeService(config)
				// we are initializing connection here
				await sqService.init(systemCollections)
				return sqService
			},
		},
		SequelizeRepoManager,
		{ provide: BootstrapRepoManager, useClass: SequelizeRepoManager },
		{ provide: AlterSchemaService, useClass: SequelizeAlterSchemaService },
		{ provide: SchemaInfoService, useClass: SequelizeSchemaInfoService },
		SequelizeSchemaInfoService,
		SequelizeAlterSchemaService
	],
	exports: [
		SequelizeService,
		SequelizeRepoManager,
		BootstrapRepoManager,
		SequelizeSchemaInfoService,
		SequelizeAlterSchemaService,
		AlterSchemaService,
		SchemaInfoService,
	]
})
export class SequelizeModule {}
