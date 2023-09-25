import { now } from "@common/utils/now"
import { DbFieldSchema, ModelSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { RelationMetadataModel } from "./relation-metadata.model"

export const RelationMetadataSchema = ModelSchema<RelationMetadataModel>()(
	z.object({
		id: z.string().uuid().default(v4),
		createdAt: z.date().default(now),
		propertyName: DbFieldSchema,
		fkName: DbFieldSchema,
		mtmFkName: DbFieldSchema.nullish().default(null),
		tableName: DbFieldSchema,
		template: z.string().max(200).nullish().default(null),
		label: z.string().min(1).max(200).nullable().default(null),
		hidden: z.boolean().default(false),
	}),
)
