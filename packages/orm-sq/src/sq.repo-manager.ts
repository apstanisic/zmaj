import {
	BaseModel,
	OrmRepository,
	RawQueryOptions,
	RepoManager,
	Transaction,
	TransactionIsolationLevel,
	createModelsStore,
} from "@zmaj-js/orm-engine"
import { isString } from "radash"
import { Sequelize, literal } from "sequelize"
import { Class } from "type-fest"
import { UndefinedModelError } from "../orm-errors"
import { SequelizeRepository } from "./sq.repository"
import { SequelizeService } from "./sq.service"

/**
 * Clearing not implemented????
 */
export class SequelizeRepoManager extends RepoManager {
	constructor(private sq: SequelizeService) {
		super()
	}

	protected models = createModelsStore()

	protected repositories: Record<string, OrmRepository<any>> = {}

	getOrm(): Sequelize {
		return this.sq.orm
	}

	getRepo<TModel extends BaseModel = BaseModel>(
		model: Class<BaseModel> | string,
	): OrmRepository<TModel> {
		const name = isString(model) ? model : this.models.getModel(model).name
		// const name = model

		// const collection = isString(col) ? col : col.collectionName

		const exist = this.sq.models[name]

		if (!exist) throw new UndefinedModelError(name)

		const repo = this.repositories[name]
		if (repo) return repo as OrmRepository<TModel>

		const created = new SequelizeRepository<TModel>(this.sq, name)
		this.repositories[name] = created as OrmRepository<any>
		return created as OrmRepository<TModel>
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
