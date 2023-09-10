import { ModelsState } from "./create-models-store"
import { DatabaseConfig } from "./database-config.type"
import { RepoManager } from "./repo/repo-manager.type"
import { AlterSchemaService } from "./schema/services/alter-schema.service"
import { SchemaInfoService } from "./schema/services/schema-info.service"

export type OrmEngine = {
	schemaInfo: SchemaInfoService
	alterSchema: AlterSchemaService
	repoManager: RepoManager
	init: () => Promise<void>
	destroy: () => Promise<void>
}

export type OrmEngineSetup = (params: { models: ModelsState; config: DatabaseConfig }) => OrmEngine

export function createOrmEngine(fn: OrmEngineSetup): OrmEngineSetup {
	return fn
}
