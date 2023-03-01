import { DbFieldSchema } from "@common/zod/zod-utils"
import { z } from "zod"

export const DbColumnSchema = z.object({
	columnName: DbFieldSchema,
	nullable: z.boolean(),
	defaultValue: z.string().nullable(),
	primaryKey: z.boolean(),
	tableName: DbFieldSchema,
	unique: z.boolean(),
	autoIncrement: z.boolean(),
	comment: z.string().optional(),
	dataType: z.string(),
	schemaName: DbFieldSchema.optional(),
})
