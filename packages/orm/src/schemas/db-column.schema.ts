import { z } from "zod"
import { DbColumnNameSchema } from "./db-column-name.schema"

export const DbColumnSchema = z.object({
	columnName: DbColumnNameSchema,
	nullable: z.boolean(),
	defaultValue: z.string().nullable(),
	primaryKey: z.boolean(),
	tableName: DbColumnNameSchema,
	unique: z.boolean(),
	autoIncrement: z.boolean(),
	comment: z.string().optional(),
	dataType: z.string(),
	schemaName: DbColumnNameSchema.optional(),
})
