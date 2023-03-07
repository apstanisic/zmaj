import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"
import { DbFieldSchema } from "../../zod/zod-utils"

const RelationUpdateSchema = z.object({
	label: z.string().nullish(),
	propertyName: DbFieldSchema.nullish().transform((v) => (v === null ? undefined : v)),
	template: z.string().nullish(),
})

export class RelationUpdateDto extends ZodDto(RelationUpdateSchema) {}
