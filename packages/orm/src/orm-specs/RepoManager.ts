import { BaseModel, ModelType } from "@zmaj-js/orm-common"
import { Class } from "type-fest"
import { OrmRepository } from "./OrmRepository"
import { RawQueryOptions } from "./RawQueryOptions"
import { Transaction } from "./Transaction"
import { TransactionIsolationLevel } from "./TransactionIsolationLevel"

export abstract class RepoManager {
	protected abstract repositories: Record<string, OrmRepository<any>>

	/**
	 * Get ORM repository
	 * @param tableOrCollection Provide either table name or infra collection
	 */
	abstract getRepo<T extends Record<string, any> = Record<string, any>>(
		tableOrCollection: string | { collectionName: string },
	): OrmRepository<T>
	abstract getRepo<TModel extends BaseModel = BaseModel>(
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
