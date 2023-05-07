import { CollectionDef, Struct } from "@zmaj-js/common"
import { BaseModel, ModelConfig, ModelType } from "@zmaj-js/orm-common"
import { OrmRepository } from "./OrmRepository"
import { RawQueryOptions } from "./RawQueryOptions"
import { Transaction } from "./Transaction"
import { TransactionIsolationLevel } from "./TransactionIsolationLevel"
import { Class } from "type-fest"

export abstract class RepoManager {
	protected abstract repositories: Struct<OrmRepository<any>>

	/**
	 * Get ORM repository
	 * @param tableOrCollection Provide either table name or infra collection
	 */
	abstract getRepo<T extends Struct<any> = Struct>(
		tableOrCollection: string | ModelConfig<T> | CollectionDef<T>,
	): OrmRepository<T>

	abstract getRepoFromModel<TModel extends BaseModel = BaseModel>(
		model: Class<TModel>,
	): OrmRepository<ModelType<TModel>>

	// abstract transaction<T>(fn: (em: Transaction) => Promise<T>): Promise<T>
	abstract transaction<T>(params: {
		trx?: Transaction
		type?: TransactionIsolationLevel
		fn: (trx: Transaction) => Promise<T>
	}): Promise<T>
	// abstract transaction<T>(fn: (em: Transaction) => Promise<T>): Promise<T>

	abstract rawQuery(query: string, options?: RawQueryOptions): Promise<unknown[]>

	// abstract getOrm<T = unknown>(): T
	abstract getOrm(): unknown

	// abstract unescaped(val: string): string
}
