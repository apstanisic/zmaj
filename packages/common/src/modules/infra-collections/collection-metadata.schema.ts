import { now } from "@common/utils/now"
import { ModelSchema, DbFieldSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { CollectionMetadata } from "./infra-collection.model"

export const CollectionMetadataSchema = ModelSchema<CollectionMetadata>()(
	z.object({
		tableName: DbFieldSchema,
		id: z.string().uuid().default(v4),
		createdAt: z.date().default(now),
		// createdAtFieldId: z.string().nullable().default(null),
		// updatedAtFieldId: z.string().nullable().default(null),
		label: z.string().nullable().default(null),
		disabled: z.boolean().default(false),
		hidden: z.boolean().default(false),
		// description: z.string().nullable().default(null),
		// icon: z.string().min(1).max(30).nullable().default(null),
		// validation: z.record(z.unknown()).default({}),
		displayTemplate: z.string().nullable().default(null),
		// fieldsOrder: z.array(z.string()).default([]),
		layoutConfig: z.record(z.unknown()).default({}),
		// .transform((v) => v as JsonValue),
	}),
)
