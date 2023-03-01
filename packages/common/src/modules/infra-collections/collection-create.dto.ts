import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"
import { DbFieldSchema } from "../../zod/zod-utils"
import { CollectionUpdateSchema } from "./collection-update.dto"

const CollectionCreateSchema = CollectionUpdateSchema.extend({
	tableName: DbFieldSchema,
	pkType: z.enum(["auto-increment", "uuid"]).default("uuid"),
	pkColumn: DbFieldSchema.default("id"),
})

export class CollectionCreateDto extends ZodDto(CollectionCreateSchema) {}
