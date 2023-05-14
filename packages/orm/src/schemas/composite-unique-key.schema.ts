import { z } from "zod"
import { DbColumnNameSchema } from "./db-column-name.schema"

export const CompositeUniqueKeySchema = z.object({
	schemaName: DbColumnNameSchema,
	tableName: DbColumnNameSchema,
	columnNames: z.tuple([DbColumnNameSchema, DbColumnNameSchema]).rest(DbColumnNameSchema),
	keyName: DbColumnNameSchema,
})
