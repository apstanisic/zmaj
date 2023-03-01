import { ZodDto } from "@common/zod"
import { DbFieldSchema } from "@common/zod/zod-utils"
import { isString } from "radash"
import { z } from "zod"
import { onColumnDeleteActions } from "./on-column-delete-actions.consts"

/**
 * Require both left and right column. We will strip if they are not required
 */
export const RelationCreateSchema = z.object({
	type: z.enum([
		"many-to-many",
		"one-to-many",
		"many-to-one",
		"owner-one-to-one",
		"ref-one-to-one",
	]),
	leftLabel: z.string().nullish(),
	rightLabel: z.string().nullish(),
	leftPropertyName: z.string(),
	rightPropertyName: z.string(),
	leftTemplate: z.string().nullable().default(null),
	rightTemplate: z.string().nullable().default(null),
	//
	// left table can't be system table
	leftTable: DbFieldSchema.refine((v) => !v.startsWith("zmaj")),
	leftColumn: DbFieldSchema,
	rightTable: DbFieldSchema,
	rightColumn: DbFieldSchema,
	//
	onDelete: z.enum(onColumnDeleteActions).nullable().default(null),
	leftFkName: DbFieldSchema.nullish(),
	// junction part
	junctionTable: DbFieldSchema.nullish().refine((v) => {
		//junction table can't be system table
		// if nil ignore
		if (isString(v) && v.startsWith("zmaj")) return false
		return true
	}),
	junctionLeftColumn: DbFieldSchema.nullish(),
	junctionRightColumn: DbFieldSchema.nullish(),
	rightFkName: DbFieldSchema.nullish(),
	// junction
	junctionLeftLabel: z.string().nullish(),
	junctionRightLabel: z.string().nullish(),
	junctionLeftPropertyName: z.string().nullish(),
	junctionRightPropertyName: z.string().nullish(),
	junctionLeftTemplate: z.string().nullish(),
	junctionRightTemplate: z.string().nullish(),
})

export class RelationCreateDto extends ZodDto(RelationCreateSchema) {}
