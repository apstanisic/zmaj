import { now } from "@common/utils/now"
import { ModelSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { TranslationModel } from "./translation.model"

const ItemId = z.union([
	z.string().min(1).max(100),
	z.number().int().gte(1).lte(Number.MAX_SAFE_INTEGER),
])

export const TranslationSchema = ModelSchema<TranslationModel>()(
	z.object({
		translations: z.record(z.string()),
		collectionId: z.string().uuid(),
		language: z.string().min(1).max(50),
		// idk why i need to specify <string> now
		itemId: ItemId.transform<string>((v): string => v.toString()), // ItemId.transform((v) => v.toString()),
		createdAt: z.date().default(now),
		id: z.string().uuid().default(v4),
	}),
)
