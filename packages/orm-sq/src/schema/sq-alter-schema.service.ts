import {
	CantBecomeNonNullableError,
	CantBecomeUniqueError,
	CreateColumnParams,
	CreateForeignKeyParams,
	CreateTableParams,
	CreateUniqueKeyParams,
	DropColumnParams,
	DropForeignKeyParams,
	DropTableParams,
	DropUniqueKeyParams,
	InternalOrmProblem,
	InvalidColumnTypeError,
	Logger,
	NoColumnError,
	NoFkToDeleteError,
	NoUniqueToDropError,
	SchemaInfoService,
	UpdateColumnParams,
} from "@zmaj-js/orm-engine"
import { alphabetical, isEqual } from "radash"
import {
	DataType,
	DataTypes,
	DatabaseError,
	QueryInterface,
	Sequelize,
	UniqueConstraintError,
} from "sequelize"
import { SequelizeService } from "../sq.service"
import {
	CreateColumnSchema,
	CreateForeignKeySchema,
	CreateTableSchema,
	CreateUniqueKeySchema,
	DropColumnSchema,
	DropForeignKeySchema,
	DropTableSchema,
	DropUniqueKeySchema,
	UpdateColumnSchema,
} from "./alter-schema.zod"

export class SequelizeAlterSchemaService {
	private qi: QueryInterface
	constructor(
		private sq: SequelizeService,
		private schemaInfo: SchemaInfoService,
		private logger: Logger = console,
	) {
		this.qi = this.sq.orm.getQueryInterface()
	}
	async createTable(params: CreateTableParams): Promise<void> {
		const data = CreateTableSchema.parse(params)

		await this.qi.createTable(
			data.tableName,
			{
				[data.pkColumn]: {
					type: data.pkType === "uuid" ? DataTypes.UUID : DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: data.pkType === "auto-increment",
					autoIncrementIdentity: data.pkType === "auto-increment",
				},
			},
			{ transaction: data.trx },
		)
	}

	async dropTable(params: DropTableParams): Promise<void> {
		const data = DropTableSchema.parse(params)
		await this.qi.dropTable(data.tableName, { transaction: data?.trx, cascade: !data.noCascade })
	}
	async createColumn(params: CreateColumnParams): Promise<void> {
		const data = CreateColumnSchema.parse(params)
		await this.qi
			.addColumn(
				data.tableName,
				data.columnName,
				{
					allowNull: data.nullable,
					autoIncrement: data.autoIncrement,
					unique: data.unique,
					defaultValue: this.parseDefaultValue(data.defaultValue),
					type: this.getType(data.dataType),
				},
				{ transaction: data?.trx },
			)
			.catch((e) => this.handleColumnError(e, data))
	}

	async updateColumn(params: UpdateColumnParams): Promise<void> {
		const data = UpdateColumnSchema.parse(params)

		const col = await this.schemaInfo.getColumn({
			table: params.tableName,
			column: params.columnName,
			trx: data.trx,
			schema: data.schema,
		})
		if (!col) throw new NoColumnError(params.tableName, params.columnName)

		// type must be provided, so we use existing type, and only pass changes that are not undefined
		await this.qi
			.changeColumn(
				data.tableName,
				data.columnName,
				{
					type: col.dataType,
					allowNull: data.nullable ?? undefined,
					unique: data.unique ?? undefined,
					defaultValue: this.parseDefaultValue(data.defaultValue),
				},
				{ transaction: data.trx },
			)
			.catch((e) => this.handleColumnError(e, data))
	}

	/**
	 * Handle error when creating or updating column.
	 * It adds custom message when column can't be not null, or can't be unique
	 */
	private handleColumnError(error: any, params: { columnName: string; tableName: string }): never {
		if (error instanceof UniqueConstraintError) {
			throw new CantBecomeUniqueError(params.tableName, params.columnName)
			// throw400(49832423, emsg.cantSetUnique)
		} else if (error instanceof DatabaseError && error.message.includes("contains null values")) {
			throw new CantBecomeNonNullableError(params.tableName, params.columnName)
			// throw400(8521992, emsg.cantSetNull)
		}

		this.logger.error(error)

		throw new InternalOrmProblem(90213, error)
	}

	async dropColumn(params: DropColumnParams): Promise<void> {
		const data = DropColumnSchema.parse(params)
		await this.qi.removeColumn(data.tableName, data.columnName, { transaction: data?.trx })
	}

	async createFk(params: CreateForeignKeyParams): Promise<void> {
		const data = CreateForeignKeySchema.parse(params)
		// const indexName = data.indexName ?? `${data.fkTable}_${data.fkColumn}_foreign`

		await this.qi.addConstraint(data.fkTable, {
			type: "foreign key",
			fields: [data.fkColumn],
			onDelete: data.onDelete ?? "NO ACTION",
			onUpdate: data.onUpdate ?? "NO ACTION",
			name: data.indexName ?? undefined,
			references: {
				table: data.referencedTable,
				field: data.referencedColumn,
			},
			transaction: data?.trx,
		})
	}

	async dropFk(params: DropForeignKeyParams): Promise<void> {
		const data = DropForeignKeySchema.parse(params)
		let keyName: string
		if (data.indexName) {
			keyName = data.indexName
		} else {
			const fk = await this.schemaInfo.getForeignKey({
				table: data.fkTable,
				column: data.fkColumn,
				schema: data.schema,
				trx: data.trx,
			})
			if (!fk) throw new NoFkToDeleteError(params.fkTable, params.fkColumn) // throw404(42000343, emsg.invalidPayload)
			keyName = fk.fkName
		}
		await this.qi.removeConstraint(data.fkTable, keyName, { transaction: data?.trx })
	}

	async createUniqueKey(params: CreateUniqueKeyParams): Promise<void> {
		const data = CreateUniqueKeySchema.parse(params)
		// const keyName = data.indexName ?? `${data.tableName}_${data.columnNames.join("_")}_unique`
		await this.qi.addConstraint(data.tableName, {
			type: "unique",
			fields: data.columnNames,
			name: data.indexName ?? undefined,
			transaction: data?.trx,
		})
	}

	async dropUniqueKey(params: DropUniqueKeyParams): Promise<void> {
		const data = DropUniqueKeySchema.parse(params)

		let keyName: string
		if (data.indexName) {
			keyName = data.indexName
		} else {
			const uniqueKeys = await this.schemaInfo.getUniqueKeys({
				table: data.tableName,
				trx: data?.trx,
			})

			const columns = alphabetical(data.columnNames, (v) => v)
			const toDelete = uniqueKeys.find((key) =>
				isEqual(
					alphabetical(key.columnNames, (v) => v),
					columns,
				),
			)
			if (!toDelete) throw new NoUniqueToDropError(data.tableName, data.columnNames) //throw404(30323, emsg.invalidPayload)
			keyName = toDelete.keyName
		}

		await this.qi.removeConstraint(data.tableName, keyName, { transaction: data?.trx })
	}

	/**
	 * Not sure about literal value
	 */
	private parseDefaultValue(value?: CreateColumnParams["defaultValue"] | null): unknown {
		if (value === undefined) return undefined
		if (value === null) return null
		return value.type === "raw" ? Sequelize.literal(value.value) : value.value
	}
	/**
	 * Merge with model-generator getType function
	 */
	private getType(dataType: CreateColumnParams["dataType"]): DataType {
		if (dataType.type === "specific") return dataType.value
		const type = dataType.value
		if (type.startsWith("array.")) {
			const mainType = this.getType(type.replace("array.", "") as any)
			return DataTypes.ARRAY(mainType as never)
		}
		switch (type) {
			case "boolean":
				return DataTypes.BOOLEAN
			case "date":
				return DataTypes.DATEONLY
			case "datetime":
				return DataTypes.DATE({ length: 3 })
			case "float":
				return DataTypes.DOUBLE
			case "int":
				return DataTypes.INTEGER
			case "json":
				return DataTypes.JSONB
			case "text":
				return DataTypes.TEXT
			case "time":
				return DataTypes.TIME
			case "uuid":
				return DataTypes.UUID

			default:
				throw new InvalidColumnTypeError(dataType.value, 19300)
		}
	}
}
