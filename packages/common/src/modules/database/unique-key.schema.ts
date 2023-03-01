import { DbFieldSchema } from "@common/zod/zod-utils"
import { z } from "zod"

export const UniqueKeySchema = z.object({
	schemaName: DbFieldSchema,
	tableName: DbFieldSchema,
	columnName: DbFieldSchema,
	keyName: DbFieldSchema,
})
