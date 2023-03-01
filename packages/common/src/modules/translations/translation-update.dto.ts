import { ZodDto } from "@common/zod/zod-dto"
import { TranslationCreateSchema } from "./translation-create.dto"

const TranslationUpdateSchema = TranslationCreateSchema.pick({ translations: true })

export class TranslationUpdateDto extends ZodDto(TranslationUpdateSchema) {}
