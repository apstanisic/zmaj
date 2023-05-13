import { OrmRepository } from "@orm/orm-specs/OrmRepository"
import { RawQueryOptions } from "@orm/orm-specs/RawQueryOptions"
import { RepoManager } from "@orm/orm-specs/RepoManager"
import { Transaction } from "@orm/orm-specs/Transaction"
import { TransactionIsolationLevel } from "@orm/orm-specs/TransactionIsolationLevel"
import { CollectionDef, Struct } from "@zmaj-js/common"
import { BaseModel, ModelType, createModelsStore } from "@zmaj-js/orm-common"
import { isFunction, isString } from "radash"
import { Sequelize, literal } from "sequelize"
import { Class } from "type-fest"
import { UndefinedModelError } from "../orm-errors"
import { SequelizeRepository } from "./sequelize.repository"
import { SequelizeService } from "./sequelize.service"

/**
 * Clearing not implemented????
 */
export class SequelizeRepoManager extends RepoManager {
	constructor(private sq: SequelizeService) {
		super()
	}

	protected models = createModelsStore()

	protected repositories: Struct<OrmRepository<any>> = {}

	getOrm(): Sequelize {
		return this.sq.orm
	}

	getRepo<T extends Struct<any> = Struct<unknown>>(col: string | CollectionDef<T>): OrmRepository<T>
	getRepo<TModel extends BaseModel = BaseModel>(
		model: Class<TModel>,
	): OrmRepository<ModelType<TModel>>
	getRepo<T extends Struct>(col: string | CollectionDef<any> | Class<BaseModel>): OrmRepository<T> {
		const name = isString(col)
			? col
			: isFunction(col)
			? this.models.get(col).name
			: col.collectionName
		// const name = model

		// const collection = isString(col) ? col : col.collectionName

		const exist = this.sq.models[name]

		if (!exist) throw new UndefinedModelError(name)

		const repo = this.repositories[name]
		if (repo) return repo as OrmRepository<T>

		const created = new SequelizeRepository<T>(this.sq, name)
		this.repositories[name] = created as OrmRepository<any>
		return created as OrmRepository<T>
	}

	/**
	 * If trx is passed, it will not create new trx, but reuse current
	 */
	async transaction<T>(params: {
		type?: TransactionIsolationLevel
		fn: (trx: Transaction) => Promise<T>
		trx?: Transaction
	}): Promise<T> {
		if (params.trx) return params.fn(params.trx)

		return this.sq.transaction<T>({
			fn: async (trx) => params.fn(trx as any),
			type: params.type,
		})
	}

	async rawQuery(query: string, options?: RawQueryOptions): Promise<unknown[]> {
		const result = await this.sq.rawQuery(query, options)
		return result
	}

	unescaped(sql: string): ReturnType<typeof literal> {
		return literal(sql)
	}
}
