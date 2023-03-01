import { now } from "@common/utils/now"
import { ModelSchema, DbFieldSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { FieldMetadata } from "."

export const FieldMetadataSchema = ModelSchema<FieldMetadata>()(
	z.object({
		columnName: DbFieldSchema,
		tableName: DbFieldSchema,
		//
		id: z.string().uuid().default(v4),
		createdAt: z.date().default(now),
		label: z.string().max(100).nullable().default(null),
		description: z.string().nullable().default(null),
		canUpdate: z.boolean().default(true),
		canCreate: z.boolean().default(true),
		canRead: z.boolean().default(true),
		componentName: z.string().min(1).max(60).nullable().default(null),
		sortable: z.boolean().default(true),
		fieldConfig: z.record(z.unknown()).default({}),
		isCreatedAt: z.boolean().default(false),
		isUpdatedAt: z.boolean().default(false),
	}),
)
