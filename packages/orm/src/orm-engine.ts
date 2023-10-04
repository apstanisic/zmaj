import { Class } from "type-fest"
import { ModelsState } from "./create-models-store"
import { DatabaseConfig } from "./database-config.type"
import { BaseModel } from "./model/base-model"
import { PojoModel } from "./model/pojo-model"
import { RawQueryOptions } from "./repo/raw-query-options.type"
import { RepoManager } from "./repo/repo-manager.type"
import { TransactionIsolationLevel } from "./repo/transaction/transaction-isolation-level"
import { Transaction } from "./repo/transaction/transaction.type"
import { AlterSchemaService } from "./schema/services/alter-schema.service"
import { SchemaInfoService } from "./schema/services/schema-info.service"

export type OrmEngine<T = unknown> = {
	schemaInfo: SchemaInfoService
	alterSchema: AlterSchemaService
	repoManager: RepoManager
	init: () => Promise<void>
	destroy: () => Promise<void>
	updateModels: (models: (PojoModel | Class<BaseModel>)[]) => void
	engineProvider: T
	//
	transaction<T>(params: {
		type?: TransactionIsolationLevel
		fn: (trx: Transaction) => Promise<T>
		trx?: Transaction
	}): Promise<T>
	rawQuery: (query: string, options?: RawQueryOptions) => Promise<unknown[]>
}

export type OrmEngineSetup<T = unknown> = (params: {
	models: ModelsState
	config: DatabaseConfig
}) => OrmEngine<T>

export function createOrmEngine<T>(fn: OrmEngineSetup<T>): OrmEngineSetup<T> {
	return fn
}
