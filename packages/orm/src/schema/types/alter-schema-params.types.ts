import { ColumnDataType } from "@orm-engine/model/fields/column-data-type"
import { Transaction } from "@orm-engine/repo/transaction/transaction.type"

type SharedParams = {
	schema?: string
	trx?: Transaction
}

export type CreateUniqueKeyParams = SharedParams & {
	tableName: string
	columnNames: [string, ...string[]]
	indexName?: string | null
}

export type DropUniqueKeyParams = CreateUniqueKeyParams

const fkOn = ["SET NULL", "CASCADE", "SET DEFAULT", "RESTRICT", "NO ACTION"] as const

type FkOn = (typeof fkOn)[number]

export type CreateForeignKeyParams = SharedParams & {
	fkTable: string
	fkColumn: string
	referencedTable: string
	referencedColumn: string
	indexName?: string | null
	onDelete?: FkOn | null
	onUpdate?: FkOn | null
}

export type DropForeignKeyParams = Pick<
	CreateForeignKeyParams,
	"schema" | "trx" | "fkTable" | "fkColumn" | "indexName"
>

export type CreateTableParams = SharedParams & {
	tableName: string
	pkColumn: string
	pkType: "uuid" | "auto-increment"
}

export type DropTableParams = SharedParams & { tableName: string; noCascade?: boolean }

type DefaultValueType = { type: "raw"; value?: any } | { type: "normal"; value: string }

export type CreateColumnParams = SharedParams & {
	columnName: string
	tableName: string
	unique?: boolean
	nullable?: boolean
	autoIncrement?: boolean
	index?: boolean
	dataType: { type: "general"; value: ColumnDataType } | { type: "specific"; value: string }
	defaultValue?: DefaultValueType | null
}

export type DropColumnParams = SharedParams & { tableName: string; columnName: string }

export type UpdateColumnParams = SharedParams & {
	tableName: string
	columnName: string
	nullable?: boolean
	unique?: boolean
	defaultValue?: DefaultValueType | null
}
