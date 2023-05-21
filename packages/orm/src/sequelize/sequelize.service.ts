import { DatabaseConfig } from "@orm/database.config"
import { Logger } from "@orm/logger.type"
import { RawQueryOptions } from "@orm/orm-specs/RawQueryOptions"
import { RepoManager } from "@orm/orm-specs/RepoManager"
import { TransactionIsolationLevel } from "@orm/orm-specs/TransactionIsolationLevel"
import { AlterSchemaService } from "@orm/orm-specs/schema/alter-schema.service"
import { SchemaInfoService } from "@orm/orm-specs/schema/schema-info.service"
import { BaseModel, ModelConfig } from "@zmaj-js/orm-common"
import { ModelStatic, QueryInterface, Sequelize, Transaction } from "sequelize"
import { Class, WritableDeep } from "type-fest"
import { SequelizeAlterSchemaService } from "./sequelize-alter-schema.service"
import { SequelizeSchemaInfoService } from "./sequelize-schema-info.service"
import { SequelizeModelsGenerator } from "./sequelize.model-generator"
import { SequelizeRepoManager } from "./sequelize.repo-manager"

const isolationMapper: Record<TransactionIsolationLevel, Transaction.ISOLATION_LEVELS> = {
	SERIALIZABLE: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
	READ_COMMITTED: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
	READ_UNCOMMITTED: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
	REPEATABLE_READ: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
}

export class SequelizeService {
	orm: Sequelize
	readonly repoManager: RepoManager
	readonly schemaInfo: SchemaInfoService
	readonly alterSchema: AlterSchemaService
	private generator: SequelizeModelsGenerator

	constructor(private dbConfig: DatabaseConfig, logger: Logger = console) {
		this.orm = new Sequelize({
			dialect: this.dbConfig.type ?? "postgres",
			// storage: this.dbConfig.filename,
			username: this.dbConfig.username,
			password: this.dbConfig.password,
			host: this.dbConfig.host,
			port: this.dbConfig.port,
			database: this.dbConfig.database,
			logging: this.dbConfig.logging ? (sql: string) => console.log(sql) : false,
			logQueryParameters: true,
			define: {
				underscored: false,
				freezeTableName: true,
				timestamps: false,
			},
		})
		this.generator = new SequelizeModelsGenerator(logger)
		this.repoManager = new SequelizeRepoManager(this)
		this.schemaInfo = new SequelizeSchemaInfoService(this)
		this.alterSchema = new SequelizeAlterSchemaService(this, this.schemaInfo, logger)
	}
	get models(): Record<string, ModelStatic<any>> {
		return this.orm.models
	}

	get qi(): QueryInterface {
		return this.orm.getQueryInterface()
	}

	async init(collections: (Class<BaseModel> | ModelConfig)[]): Promise<void> {
		this.generateModels(collections)
		await this.orm.authenticate()
	}

	// async initCms(collections: readonly CollectionDef[]): Promise<void> {
	// 	this.generateModels(collections.map(collectionToModel))
	// 	await this.orm.authenticate()
	// }

	generateModels(models: readonly (Class<BaseModel> | ModelConfig)[]): void {
		this.generator.generateModels(models, this.orm)
	}

	// generateModelsCms(collections: readonly CollectionDef[]): void {
	// 	this.generator.generateModels(collections.map(collectionToModel), this.orm)
	// }

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
				const result = await params.fn(trx)
				return result
			},
		)
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

	// async onModuleDestroy(): Promise<void> {
	async close(): Promise<void> {
		await this.orm.close()
	}

	async onModuleDestroy(): Promise<void> {
		await this.close()
	}
}
