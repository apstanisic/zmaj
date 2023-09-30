import { Class } from "type-fest"
import { NameTransformer } from "./NameTransformer"
import { ModelsState, createModelsStore } from "./create-models-store"
import { DatabaseConfig } from "./database-config.type"
import { BaseModel } from "./model/base-model"
import { PojoModel } from "./model/pojo-model"
import { OrmEngine, OrmEngineSetup } from "./orm-engine"
import { RepoManager } from "./repo/repo-manager.type"
import { AlterSchemaService } from "./schema/services/alter-schema.service"
import { SchemaInfoService } from "./schema/services/schema-info.service"
type OrmParams = {
	engine: OrmEngineSetup
	config: DatabaseConfig
	models: Class<BaseModel>[]
	nameTransformer?: NameTransformer
}

export class Orm {
	readonly alterSchema: AlterSchemaService
	readonly schemaInfo: SchemaInfoService
	readonly repoManager: RepoManager
	readonly models: ModelsState
	public readonly engine: OrmEngine

	constructor(params: OrmParams) {
		this.models = createModelsStore({ nameTransformer: params.nameTransformer })
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

	updateModels(models: (Class<BaseModel> | PojoModel)[]): void {
		this.engine.updateModels(models)
	}
}
