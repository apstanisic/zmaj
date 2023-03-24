import { throw400, throw404, throw500 } from "@api/common/throw-http"
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
} from "@api/database/schema/alter-schema.schemas"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { emsg } from "@api/errors"
import { Injectable, Logger } from "@nestjs/common"
import { alphabetical, isEqual } from "radash"
import {
	DataType,
	DataTypes,
	DatabaseError,
	QueryInterface,
	Sequelize,
	UniqueConstraintError,
} from "sequelize"
import { z } from "zod"
import { SequelizeService } from "./sequelize.service"

@Injectable()
export class SequelizeAlterSchemaService {
	private logger = new Logger(SequelizeAlterSchemaService.name)
	private qi: QueryInterface
	constructor(private sq: SequelizeService, private schemaInfo: SchemaInfoService) {
		this.qi = this.sq.orm.getQueryInterface()
	}
	async createTable(params: z.input<typeof CreateTableSchema>): Promise<void> {
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

	async dropTable(params: z.input<typeof DropTableSchema>): Promise<void> {
		const data = DropTableSchema.parse(params)
		await this.qi.dropTable(data.tableName, { transaction: data?.trx, cascade: !data.noCascade })
	}
	async createColumn(params: z.input<typeof CreateColumnSchema>): Promise<void> {
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
			.catch((e) => this.handleColumnError(e))
	}

	async updateColumn(params: z.input<typeof UpdateColumnSchema>): Promise<void> {
		const data = UpdateColumnSchema.parse(params)

		const col = await this.schemaInfo.getColumn({
			table: params.tableName,
			column: params.columnName,
			trx: data.trx,
			schema: data.schema,
		})
		if (!col) throw500(889931)

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
			.catch((e) => this.handleColumnError(e))
	}

	/**
	 * Handle error when creating or updating column.
	 * It adds custom message when column can't be not null, or can't be unique
	 */
	private handleColumnError(error: any): never {
		if (error instanceof UniqueConstraintError) {
			throw400(49832423, emsg.cantSetUnique)
		} else if (error instanceof DatabaseError && error.message.includes("contains null values")) {
			throw400(8521992, emsg.cantSetNull)
		}

		this.logger.error(error)

		throw500({ cause: error, errorCode: 5238999 })
	}

	async dropColumn(params: z.input<typeof DropColumnSchema>): Promise<void> {
		const data = DropColumnSchema.parse(params)
		await this.qi.removeColumn(data.tableName, data.columnName, { transaction: data?.trx })
	}

	async createFk(params: z.input<typeof CreateForeignKeySchema>): Promise<void> {
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

	async dropFk(params: z.input<typeof DropForeignKeySchema>): Promise<void> {
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
			if (!fk) throw404(42000343, emsg.invalidPayload)
			keyName = fk.fkName
		}
		await this.qi.removeConstraint(data.fkTable, keyName, { transaction: data?.trx })
	}

	async createUniqueKey(params: z.input<typeof CreateUniqueKeySchema>): Promise<void> {
		const data = CreateUniqueKeySchema.parse(params)
		// const keyName = data.indexName ?? `${data.tableName}_${data.columnNames.join("_")}_unique`
		await this.qi.addConstraint(data.tableName, {
			type: "unique",
			fields: data.columnNames,
			name: data.indexName ?? undefined,
			transaction: data?.trx,
		})
	}

	async dropUniqueKey(params: z.input<typeof DropUniqueKeySchema>): Promise<void> {
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
			if (!toDelete) throw404(30323, emsg.invalidPayload)
			keyName = toDelete.keyName
		}

		await this.qi.removeConstraint(data.tableName, keyName, { transaction: data?.trx })
	}

	/**
	 * Not sure about literal value
	 */
	private parseDefaultValue(value: z.infer<typeof CreateColumnSchema>["defaultValue"]): unknown {
		if (value === undefined) return undefined
		if (value === null) return null
		return value.type === "raw" ? Sequelize.literal(value.value) : value.value
	}
	/**
	 * Merge with model-generator getType function
	 */
	private getType(dataType: z.infer<typeof CreateColumnSchema>["dataType"]): string | DataType {
		if (dataType.type === "specific") return dataType.value
		const type = dataType.value
		if (type === "boolean") {
			return DataTypes.BOOLEAN
		} else if (type === "date") {
			return DataTypes.DATEONLY
		} else if (type === "datetime") {
			return DataTypes.DATE({ length: 3 })
		} else if (type === "float") {
			return DataTypes.DOUBLE
		} else if (type === "int") {
			return DataTypes.INTEGER
		} else if (type === "json") {
			return DataTypes.JSONB
		} else if (type === "long-text") {
			return DataTypes.TEXT
		} else if (type === "short-text") {
			return DataTypes.STRING
		} else if (type === "time") {
			return DataTypes.TIME
		} else if (type === "uuid") {
			return DataTypes.UUID
		} else {
			throw500(35412932)
		}
	}
}
