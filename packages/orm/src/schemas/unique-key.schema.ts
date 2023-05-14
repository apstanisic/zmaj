import { z } from "zod"
import { DbColumnNameSchema } from "./db-column-name.schema"

export const UniqueKeySchema = z.object({
	schemaName: DbColumnNameSchema,
	tableName: DbColumnNameSchema,
	columnName: DbColumnNameSchema,
	keyName: DbColumnNameSchema,
})
