import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"
import { DbFieldSchema } from "../../zod/zod-utils"

const RelationUpdateSchema = z.object({
	label: z.string().optional(),
	propertyName: DbFieldSchema.optional(),
	template: z.string().nullish(),
})

export class RelationUpdateDto extends ZodDto(RelationUpdateSchema) {}
