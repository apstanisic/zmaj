import { ZodDto, ZodIdType } from "@common/zod"
import { z } from "zod"

export const TranslationCreateSchema = z.object({
	language: z.string().min(1).max(30),
	// db can't store numbers and strings, so we always set as string
	itemId: ZodIdType().transform((v) => String(v)),
	collectionId: z.string().uuid(),
	translations: z.record(z.string()),
})

export class TranslationCreateDto extends ZodDto(TranslationCreateSchema) {}
