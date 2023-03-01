import { CompositeUniqueKey, DbColumn, ForeignKey } from "@zmaj-js/common"
import { Transaction } from "../orm-specs/Transaction"

type CommonOptions = { schema?: string; trx?: Transaction }

export abstract class SchemaInfoService {
	// https://stackoverflow.com/a/24089729
	abstract hasTable(table: string, other?: CommonOptions): Promise<boolean>

	abstract hasColumn(table: string, column: string, other?: CommonOptions): Promise<boolean>

	abstract getTableNames(shared?: CommonOptions): Promise<string[]>

	abstract getColumns(
		tableName?: string,
		columnName?: string,
		shared?: CommonOptions,
	): Promise<DbColumn[]>

	abstract getPrimaryKey(tableName: string, shared?: CommonOptions): Promise<DbColumn>

	abstract getColumn(
		table: string,
		column: string,
		shared?: CommonOptions,
	): Promise<Readonly<DbColumn> | undefined>

	abstract getForeignKeys(
		table?: string,
		column?: string,
		shared?: CommonOptions,
	): Promise<ForeignKey[]>

	abstract getForeignKey(
		table: string,
		column: string,
		shared?: CommonOptions,
	): Promise<ForeignKey | undefined>

	abstract getSingleUniqueKeys(
		tableName?: string,
		shared?: CommonOptions,
	): Promise<SingleUniqueKey[]>

	abstract getCompositeUniqueKeys(
		tableName?: string,
		shared?: CommonOptions,
	): Promise<CompositeUniqueKey[]>

	abstract getUniqueKeys(
		tableName?: string | undefined,
		shared?: CommonOptions & { type?: "all" | "single" | "composite" },
	): Promise<Readonly<UniqueKey>[]>
}

export type UniqueKey = {
	schemaName: string
	tableName: string
	keyName: string
	columnNames: [string, ...string[]]
}

export type SingleUniqueKey = {
	schemaName: string
	tableName: string
	keyName: string
	columnName: string
}

export type CompositeUnique = {
	schemaName: string
	tableName: string
	keyName: string
	columnNames: [string, string, ...string[]]
}
