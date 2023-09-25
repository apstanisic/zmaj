import { Class } from "type-fest"
import { ModelsState, createModelsStore } from "./create-models-store"
import { DatabaseConfig } from "./database-config.type"
import { BaseModel } from "./model/base-model"
import { OrmEngine, OrmEngineSetup } from "./orm-engine"
import { RepoManager } from "./repo/repo-manager.type"
import { AlterSchemaService } from "./schema/services/alter-schema.service"
import { SchemaInfoService } from "./schema/services/schema-info.service"

type OrmParams = {
	engine: OrmEngineSetup
	config: DatabaseConfig
	models: Class<BaseModel>[]
}

export class Orm {
	readonly alterSchema: AlterSchemaService
	readonly schemaInfo: SchemaInfoService
	readonly repoManager: RepoManager
	readonly models: ModelsState
	public readonly engine: OrmEngine

	constructor(params: OrmParams) {
		this.models = createModelsStore()
		this.models.init(params.models)
		this.engine = params.engine({ config: params.config, models: this.models })
		this.alterSchema = this.engine.alterSchema
		this.schemaInfo = this.engine.schemaInfo
		this.repoManager = this.engine.repoManager
	}

	async init(): Promise<void> {
		await this.engine.init()
	}

	async destroy(): Promise<void> {
		await this.engine.destroy()
	}
}
