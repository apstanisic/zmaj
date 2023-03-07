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
		label: z.string().nullable().default(null),
		disabled: z.boolean().default(false),
		hidden: z.boolean().default(false),
		displayTemplate: z.string().nullable().default(null),
		layoutConfig: z.record(z.unknown()).default({}),
	}),
)
