import { DbFieldSchema, zodStripNull } from "@common/zod/zod-utils"
import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"
import { allColumnDataTypes } from "./all-column-data-types.consts"
import { FieldUpdateSchema } from "./field-update.dto"

export const FieldCreateSchema = FieldUpdateSchema.omit({
	dbDefaultValue: true,
	isNullable: true,
	isUnique: true,
}).extend({
	columnName: DbFieldSchema,
	fieldName: DbFieldSchema.nullish().transform(zodStripNull),
	collectionName: DbFieldSchema,
	dataType: z.enum(allColumnDataTypes).transform((val) => {
		return val === "short-text" || val === "long-text" ? "text" : val
	}),
	isUnique: z.boolean().default(false),
	isNullable: z.boolean().default(true),
	dbDefaultValue: z.unknown().nullish().default(null),
})

export class FieldCreateDto extends ZodDto(FieldCreateSchema) {}
