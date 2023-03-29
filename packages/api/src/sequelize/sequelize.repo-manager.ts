import { throw500 } from "@api/common/throw-http"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RawQueryOptions } from "@api/database/orm-specs/RawQueryOptions"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { TransactionIsolationLevel } from "@api/database/orm-specs/TransactionIsolationLevel"
import { Injectable } from "@nestjs/common"
import { Sequelize, literal } from "sequelize"
import { CollectionDef, Struct } from "@zmaj-js/common"
import { isString } from "radash"
import { SequelizeRepository } from "./sequelize.repository"
import { SequelizeService } from "./sequelize.service"

/**
 * Clearing not implemented????
 */
@Injectable()
export class SequelizeRepoManager extends RepoManager {
	constructor(private sq: SequelizeService) {
		super()
	}
	protected repositories: Struct<OrmRepository<any>> = {}

	getOrm(): Sequelize {
		return this.sq.orm
	}

	getRepo<T extends Struct<any> = Struct<unknown>>(
		col: string | CollectionDef<T>,
	): OrmRepository<T> {
		const collection = isString(col) ? col : col.collectionName

		const exist = this.sq.models[collection]

		if (!exist) throw500(73924)

		const repo = this.repositories[collection]
		if (repo) return repo as OrmRepository<T>
		const created = new SequelizeRepository<T>(this.sq, collection)
		this.repositories[collection] = created as OrmRepository<any>
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
