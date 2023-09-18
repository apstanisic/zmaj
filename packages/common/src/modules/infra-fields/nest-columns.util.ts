import { Struct } from "@common/types"
import { group, mapValues, objectify } from "radash"
import { DbColumn } from "../database/db-column.type"
import { FieldDef } from "./field-def.type"
import { FieldMetadata } from "./field-metadata.model"

/**
 * Returns in format result['comments']['post_id']
 */
export function nestByTableAndColumnName<T extends DbColumn | FieldMetadata | FieldDef>(
	columns: T[],
): Struct<Struct<T>> {
	const groups = group(columns, (col) => col.tableName)
	return mapValues(groups, (colInOneTable) =>
		objectify(colInOneTable ?? [], (col) => col.columnName),
	)
}
