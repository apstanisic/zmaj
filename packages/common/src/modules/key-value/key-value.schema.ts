import { now } from "@common/utils/now"
import { CreateModelSchema, ModelSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { KeyValueModel } from "./key-value.model"

export const KeyValueSchema = ModelSchema<KeyValueModel>()(
	z.object({
		key: z.string().min(1).max(150),
		value: z.string().nullable(),
		namespace: z.string().min(1).max(100).nullable().default(null),
		id: z.string().uuid().default(v4),
		// description: z.string().min(0).max(200).nullable().default(null),
		expiresAt: z.date().nullable().default(null),
		createdAt: z.date().default(now),
		updatedAt: z.date().default(now),
	}),
)

export const CreateKeyValueSchema = CreateModelSchema<KeyValueModel>()(
	z.object({
		key: z.string().min(1).max(150),
		value: z.string().nullable().default(null),
		namespace: z.string().min(1).max(100).nullable().default(null),
		expiresAt: z.date().nullable().default(null),
	}),
)
