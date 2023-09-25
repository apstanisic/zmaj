import { ColumnDataType } from "./column-data-type.schema"

/**
 * Maps raw database type to Common Types
 */
export function getColumnType(columnType?: string | null): ColumnDataType {
	const type = (columnType ?? "").toLowerCase()

	if (type.endsWith("[]")) return "array.text"

	if (type.includes("bool")) return "boolean"

	if (type.includes("uuid")) return "uuid"

	if (type.includes("json")) return "json"

	if (type.includes("int")) return "int"
	if (type.includes("serial")) return "int"
	if (type.includes("double")) return "float"
	if (type.includes("float")) return "float"
	if (type.includes("decimal")) return "float"
	if (type.includes("real")) return "float"
	if (type.includes("numeric")) return "float"
	if (type.includes("number")) return "float"

	if (type.includes("timestamp")) return "datetime"
	if (type.includes("date") && type.includes("time")) return "datetime"
	if (type.includes("date") && !type.includes("time")) return "date"
	if (!type.includes("date") && type.includes("time")) return "time"

	// character varying
	// No longer valid, since I'm using varchar for all
	if (type.includes("var") && type.includes("char")) return "text"

	if (type.includes("text")) return "text"

	return "text"
}
