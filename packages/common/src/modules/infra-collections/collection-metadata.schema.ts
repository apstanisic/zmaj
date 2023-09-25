import { now } from "@common/utils/now"
import { DbFieldSchema, ModelSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { CollectionMetadataModel } from "./collection-metadata.model"

export const CollectionMetadataSchema = ModelSchema<CollectionMetadataModel>()(
	z.object({
		tableName: DbFieldSchema,
		collectionName: DbFieldSchema,
		id: z.string().uuid().default(v4),
		createdAt: z.date().default(now),
		label: z.string().nullable().default(null),
		disabled: z.boolean().default(false),
		hidden: z.boolean().default(false),
		displayTemplate: z.string().nullable().default(null),
		layoutConfig: z.record(z.any()).default({}),
	}),
)
