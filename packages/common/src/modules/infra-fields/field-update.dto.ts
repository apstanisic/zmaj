import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"
import { FieldMetadataSchema } from "./field-metadata.schema"

export const FieldUpdateSchema = FieldMetadataSchema.pick({
	canCreate: true,
	canUpdate: true,
	canRead: true,
	componentName: true,
	description: true,
	fieldConfig: true,
	label: true,
	displayTemplate: true,
	isUpdatedAt: true,
	isCreatedAt: true,
})
	.extend({
		isUnique: z.boolean().nullish(),
		isNullable: z.boolean().nullish(),
		dbDefaultValue: z.unknown().nullish(),
	})
	.partial()

export class FieldUpdateDto extends ZodDto(FieldUpdateSchema) {}
