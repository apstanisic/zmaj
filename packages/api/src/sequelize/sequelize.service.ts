import { DatabaseConfig } from "@api/database/database.config"
import { RawQueryOptions } from "@api/database/orm-specs/RawQueryOptions"
import { TransactionIsolationLevel } from "@api/database/orm-specs/TransactionIsolationLevel"
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common"
import { ModelStatic, QueryInterface, Sequelize, Transaction } from "sequelize"
import { CollectionDef, Struct } from "@zmaj-js/common"
import { WritableDeep } from "type-fest"
import { SequelizeModelsGenerator } from "./sequelize.model-generator"

const isolationMapper: Record<TransactionIsolationLevel, Transaction.ISOLATION_LEVELS> = {
	SERIALIZABLE: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
	READ_COMMITTED: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
	READ_UNCOMMITTED: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
	REPEATABLE_READ: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
}

@Injectable()
export class SequelizeService implements OnModuleDestroy {
	logger = new Logger(SequelizeService.name)
	orm: Sequelize
	constructor(private dbConfig: DatabaseConfig) {
		this.orm = new Sequelize({
			dialect: this.dbConfig.type,
			// storage: this.dbConfig.filename,
			username: this.dbConfig.username,
			password: this.dbConfig.password,
			host: this.dbConfig.host,
			port: this.dbConfig.port,
			database: this.dbConfig.database,
			logging: this.dbConfig.logging ? (sql: string) => console.log(sql) : false,
			logQueryParameters: true,
			define: {
				underscored: true,
				freezeTableName: true,
				timestamps: false,
			},
		})
	}
	get models(): Struct<ModelStatic<any>> {
		return this.orm.models
	}

	private generator = new SequelizeModelsGenerator()

	get qi(): QueryInterface {
		return this.orm.getQueryInterface()
	}

	async init(collections: readonly CollectionDef[]): Promise<void> {
		this.generateModels(collections)
		await this.orm.authenticate()
	}

	generateModels(collections: readonly CollectionDef[]): void {
		this.generator.generateModels(collections, this.orm)
	}

	async transaction<T>(params: {
		type?: TransactionIsolationLevel
		fn: (trx: Transaction) => Promise<T>
	}): Promise<T> {
		// if user provides trx, use that
		return this.orm.transaction(
			{
				isolationLevel: params.type ? isolationMapper[params.type] : undefined,
			},
			async (trx) => {
				//
				const result = await params.fn(trx)
				return result
			},
		)
		// const trx = await this.orm.startUnmanagedTransaction({
		// 	isolationLevel: params.type ? isolationMapper[params.type] : undefined,
		// })

		// try {
		// 	const result = await params.fn(trx)
		// 	await trx.commit()
		// 	return result
		// } catch (error) {
		// 	await trx.rollback()
		// 	throw error
		// }
	}

	async rawQuery(query: string, options?: RawQueryOptions): Promise<unknown[]> {
		const res = await this.orm.query(query, {
			// `bind` will depend on db to replace, while `replacements` will be replaced by sequelize
			// params is readonly
			bind: options?.params as WritableDeep<RawQueryOptions["params"]>,
			transaction: options?.trx as any,
		})
		return res[0]
	}

	async onModuleDestroy(): Promise<void> {
		await this.orm.close()
	}
}
