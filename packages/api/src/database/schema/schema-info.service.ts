import { CompositeUniqueKey, DbColumn, ForeignKey } from "@zmaj-js/common"
import { SetRequired } from "type-fest"
import { Transaction } from "../orm-specs/Transaction"

export type SchemaInfoBasicParams = { schema?: string; trx?: Transaction }
export type TableOnlyParams = { table?: string } & SchemaInfoBasicParams
export type TableAndColumnParams = { table?: string; column?: string } & SchemaInfoBasicParams
export type RequiredTableAndColumnParams = SetRequired<TableAndColumnParams, "column" | "table">

export abstract class SchemaInfoService {
	abstract hasTable(table: string, other?: SchemaInfoBasicParams): Promise<boolean>

	abstract hasColumn(table: string, column: string, other?: SchemaInfoBasicParams): Promise<boolean>

	abstract getPrimaryKey(tableName: string, shared?: SchemaInfoBasicParams): Promise<DbColumn>

	abstract getTableNames(shared?: SchemaInfoBasicParams): Promise<string[]>

	abstract getColumns(options?: TableAndColumnParams): Promise<DbColumn[]>

	abstract getColumn(
		options?: RequiredTableAndColumnParams,
	): Promise<Readonly<DbColumn> | undefined>

	abstract getForeignKeys(options?: TableAndColumnParams): Promise<ForeignKey[]>

	abstract getForeignKey(options: RequiredTableAndColumnParams): Promise<ForeignKey | undefined>

	abstract getSingleUniqueKeys(options?: TableOnlyParams): Promise<SingleUniqueKey[]>

	abstract getCompositeUniqueKeys(options?: TableOnlyParams): Promise<CompositeUniqueKey[]>

	abstract getUniqueKeys(
		options?: TableOnlyParams & { type?: "all" | "single" | "composite" },
	): Promise<UniqueKey[]>
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
