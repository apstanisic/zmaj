import {
	AlterSchemaService,
	BaseModel,
	DatabaseConfig,
	ModelsState,
	OrmLogger,
	PojoModel,
	RawQueryOptions,
	RepoManager,
	SchemaInfoService,
	TransactionIsolationLevel,
} from "@zmaj-js/orm"
import { ModelStatic, QueryInterface, Sequelize, Transaction } from "sequelize"
import { Class, WritableDeep } from "type-fest"
import { SequelizeAlterSchemaService } from "./schema/sq-alter-schema.service"
import { SequelizeSchemaInfoService } from "./schema/sq-schema-info.service"
import { SequelizeModelsGenerator } from "./sq.model-generator"
import { SequelizeRepoManager } from "./sq.repo-manager"

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

	constructor(
		private dbConfig: DatabaseConfig,
		logger: OrmLogger = console,
		private modelsStore: ModelsState,
	) {
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
		this.repoManager = new SequelizeRepoManager(this, modelsStore)
		this.schemaInfo = new SequelizeSchemaInfoService(this)
		this.alterSchema = new SequelizeAlterSchemaService(this, this.schemaInfo, logger)
	}
	get sqModels(): Record<string, ModelStatic<any>> {
		return this.orm.models
	}

	get qi(): QueryInterface {
		return this.orm.getQueryInterface()
	}

	// async init(collections: (Class<BaseModel> | ModelConfig)[]): Promise<void> {
	async init(): Promise<void> {
		this.generateModels(this.modelsStore.getAllAsPojo())
		await this.orm.authenticate()
	}

	generateModels(models: (Class<BaseModel> | PojoModel)[]): void {
		this.generator.generateModels(this.modelsStore.init(models), this.orm)
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
