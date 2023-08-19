import { BaseModel } from "@orm-engine/model/base-model"
import { Class } from "type-fest"
import { OrmRepository } from "./OrmRepository"
import { RawQueryOptions } from "./raw-query-options.type"
import { TransactionIsolationLevel } from "./transaction-isolation-level"
import { Transaction } from "./transaction.type"

export abstract class RepoManager {
	protected abstract repositories: Record<string, OrmRepository<any>>

	/**
	 * Get ORM repository
	 * @param tableOrCollection Provide either table name or infra collection
	 */
	abstract getRepo<TModel extends BaseModel = BaseModel>(
		model: Class<TModel> | string,
	): OrmRepository<TModel>

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
