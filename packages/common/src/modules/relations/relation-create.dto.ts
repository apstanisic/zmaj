import { ZodDto, nilDefault } from "@common/zod"
import { DbFieldSchema } from "@common/zod/zod-utils"
import { isString } from "radash"
import { Except } from "type-fest"
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
	leftCollection: DbFieldSchema.refine((v) => !v.startsWith("zmaj")),
	leftColumn: DbFieldSchema,
	rightCollection: DbFieldSchema,
	rightColumn: DbFieldSchema,
	//
	onDelete: z
		.enum(onColumnDeleteActions)
		.nullish()
		.transform((v) => v ?? "SET NULL"),
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

const sideOptions = z.object({
	propertyName: DbFieldSchema,
	column: DbFieldSchema,
	label: z.string().nullish(),
	template: z.string().nullish(),
})
const junctionSide = sideOptions
	.pick({ label: true, template: true })
	.extend({ propertyName: DbFieldSchema.nullish(), column: DbFieldSchema.nullish() })
	.nullish()

const v2 = z.object({
	type: z.enum([
		"many-to-many",
		"one-to-many",
		"many-to-one",
		"owner-one-to-one",
		"ref-one-to-one",
	]),
	leftCollection: DbFieldSchema,
	rightCollection: DbFieldSchema,
	left: sideOptions,
	right: sideOptions,
	fkName: DbFieldSchema.nullish(),
	junction: z
		.object({
			tableName: DbFieldSchema.nullish(),
			left: junctionSide,
			right: junctionSide,
			fkName: DbFieldSchema.nullish(),
		})
		.nullish(),
	onDelete: z.enum(onColumnDeleteActions).nullish().transform(nilDefault("SET NULL")),
})

export class RelationCreateDto extends ZodDto(v2) {}

export type DirectRelationCreateDto2 = Except<RelationCreateDto, "type" | "junction"> & {
	type: "many-to-one" | "owner-one-to-one"
}

export type DirectRelationCreateDto3 = DirectRelationCreateDto2 & {
	left: DirectRelationCreateDto2["left"] & { table: string }
	right: DirectRelationCreateDto2["right"] & { table: string }
	pkType: string
	fkName: string
}

export type JunctionRelationCreateDto2 = {
	type: "many-to-many"
	left: DirectRelationCreateDto2["left"] & {
		table: string
		pkType: string
		fkName: string
		collectionName: string
	}
	right: DirectRelationCreateDto2["right"] & {
		table: string
		pkType: string
		fkName: string
		collectionName: string
	}
	junction: {
		table: string
		left: DirectRelationCreateDto2["left"]
		right: DirectRelationCreateDto2["right"]
	}
}
