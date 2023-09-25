import { DbColumn } from "../types/db-column.type"
import { ForeignKey } from "../types/foreign-key.type"
import {
	GetColumnParams,
	GetColumnsParams,
	GetCompositeUniqueKeysParams,
	GetForeignKeyParams,
	GetForeignKeysParams,
	GetPrimaryKeyParams,
	GetSingleUniqueKeysParams,
	GetTableNamesParams,
	GetUniqueKeysParams,
	HasColumnParams,
	HasTableParams,
} from "../types/schema-info-params.types"
import { CompositeUniqueKey, SingleUniqueKey, UniqueKey } from "../types/unique-key.types"

export abstract class SchemaInfoService {
	abstract hasTable(params: HasTableParams): Promise<boolean>

	abstract hasColumn(params: HasColumnParams): Promise<boolean>

	abstract getPrimaryKey(params: GetPrimaryKeyParams): Promise<DbColumn>

	abstract getTableNames(params?: GetTableNamesParams): Promise<string[]>

	abstract getColumns(params?: GetColumnsParams): Promise<DbColumn[]>

	abstract getColumn(params: GetColumnParams): Promise<Readonly<DbColumn> | undefined>

	abstract getForeignKeys(params?: GetForeignKeysParams): Promise<ForeignKey[]>

	abstract getForeignKey(params: GetForeignKeyParams): Promise<ForeignKey | undefined>

	abstract getSingleUniqueKeys(params?: GetSingleUniqueKeysParams): Promise<SingleUniqueKey[]>

	abstract getCompositeUniqueKeys(
		params?: GetCompositeUniqueKeysParams,
	): Promise<CompositeUniqueKey[]>

	abstract getUniqueKeys(params?: GetUniqueKeysParams): Promise<UniqueKey[]>
}
