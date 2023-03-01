import { z } from "zod"
import { columnDataTypes } from "./column-data-types"

/**
 * Main column types that this app uses
 */
export type ColumnDataType = z.infer<typeof ColumnDataTypeSchema>

export type ColumnDataTypeWithArray = ColumnDataType | `${ColumnDataType}-array`

export const ColumnDataTypeSchema = z.enum(columnDataTypes)
