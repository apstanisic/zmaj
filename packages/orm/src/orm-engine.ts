import { ModelsState } from "./create-models-store"
import { DatabaseConfig } from "./database-config.type"
import { RepoManager } from "./repo/repo-manager.type"
import { AlterSchemaService } from "./schema/services/alter-schema.service"
import { SchemaInfoService } from "./schema/services/schema-info.service"

export type OrmEngine<T = unknown> = {
	schemaInfo: SchemaInfoService
	alterSchema: AlterSchemaService
	repoManager: RepoManager
	init: () => Promise<void>
	destroy: () => Promise<void>
	updateModels: (models: ModelsState) => void
	engineProvider: T
}

export type OrmEngineSetup<T = unknown> = (params: {
	models: ModelsState
	config: DatabaseConfig
}) => OrmEngine<T>

export function createOrmEngine<T>(fn: OrmEngineSetup<T>): OrmEngineSetup<T> {
	return fn
}
