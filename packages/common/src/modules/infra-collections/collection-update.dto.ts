import { DbFieldSchema, zodStripNull } from "@common/zod"
import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"
import { LayoutConfigSchema } from "./layout/layout-config.schema"

export const CollectionUpdateSchema = z.object({
	disabled: z.boolean().optional(),
	hidden: z.boolean().optional(),
	label: z.string().max(200).nullish(),
	layoutConfig: LayoutConfigSchema.optional(),
	displayTemplate: z.string().max(500).nullish(),
	collectionName: DbFieldSchema.nullish().transform(zodStripNull),
})

export class CollectionUpdateDto extends ZodDto(CollectionUpdateSchema) {}
