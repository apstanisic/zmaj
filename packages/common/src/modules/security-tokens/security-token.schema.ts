import { now } from "@common/utils/now"
import { ModelSchema } from "@common/zod"
import { add } from "date-fns"
import { v4 } from "uuid"
import { z } from "zod"
import { SecurityTokenModel } from "./security-token.model"

export const SecurityTokenSchema = ModelSchema<SecurityTokenModel>()(
	z.object({
		createdAt: z.date().default(now),
		id: z.string().uuid().default(v4),
		usedFor: z.string().min(2).max(100),
		userId: z.string().uuid(),
		validUntil: z.date().default(() => add(new Date(), { days: 3 })),
		data: z.string().max(200).nullable().default(null),
		token: z.string().uuid().default(v4),
	}),
)
