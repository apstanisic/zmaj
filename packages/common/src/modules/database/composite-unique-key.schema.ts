import { DbFieldSchema } from "@common/zod/zod-utils"
import { z } from "zod"

export const CompositeUniqueKeySchema = z.object({
	schemaName: DbFieldSchema,
	tableName: DbFieldSchema,
	columnNames: z.tuple([DbFieldSchema, DbFieldSchema]).rest(DbFieldSchema),
	keyName: DbFieldSchema,
})
