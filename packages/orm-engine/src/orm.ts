import { Class } from "type-fest"
import { ModelsState, createModelsStore } from "./create-models-store"
import { DatabaseConfig } from "./database-config.type"
import { BaseModel } from "./model/base-model"
import { RepoManager } from "./repo/repo-manager.type"
import { AlterSchemaService } from "./schema/services/alter-schema.service"
import { SchemaInfoService } from "./schema/services/schema-info.service"

export type OrmProvider = (params: { models: ModelsState; config: DatabaseConfig }) => {
	schemaInfo: SchemaInfoService
	alterSchema: AlterSchemaService
	repoManager: RepoManager
	init: () => Promise<void>
	destroy: () => Promise<void>
}
type OrmParams = {
	provider: OrmProvider
	config: DatabaseConfig
	models: Class<BaseModel>[]
}

export class Orm {
	readonly alterSchema: AlterSchemaService
	readonly schemaInfo: SchemaInfoService
	readonly repoManager: RepoManager
	readonly models: ModelsState
	private readonly provider: ReturnType<OrmProvider>

	constructor(params: OrmParams) {
		this.models = createModelsStore()
		this.models.set(params.models)
		this.provider = params.provider({ config: params.config, models: this.models })
		this.alterSchema = this.provider.alterSchema
		this.schemaInfo = this.provider.schemaInfo
		this.repoManager = this.provider.repoManager
	}

	async init(): Promise<void> {
		await this.provider.init()
	}

	async destroy(): Promise<void> {
		await this.provider.destroy()
	}
}
