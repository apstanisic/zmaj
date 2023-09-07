import { DbColumn } from "../types/db-column.type"
import { ForeignKey } from "../types/foreign-key.type"
import {
	RequiredTableAndColumnParams,
	SchemaInfoBasicParams,
	TableAndColumnParams,
	TableOnlyParams,
} from "../types/schema-info-params.types"
import { CompositeUniqueKey, SingleUniqueKey, UniqueKey } from "../types/unique-key.types"

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
