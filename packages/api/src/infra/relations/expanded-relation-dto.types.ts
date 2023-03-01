import { RelationCreateDto } from "@zmaj-js/common"
import { z } from "zod"

type NotNil<T> = {
	[key in keyof T]-?: Exclude<T[key], null>
}

export type DirectRelationCreateDto = {
	rightPkType: string
	/** We need to convert o2m to m2o */
	type: "many-to-one" | "owner-one-to-one"
} & Required<
	Pick<
		RelationCreateDto,
		| "leftColumn"
		| "leftTable"
		| "leftPropertyName"
		| "leftLabel"
		| "leftFkName"
		| "leftTemplate"
		//
		| "rightColumn"
		| "rightTable"
		| "rightPropertyName"
		| "rightLabel"
		| "rightTemplate"
		| "onDelete"
	>
>
RelationCreateDto.zodSchema
	.pick({
		leftColumn: true,
		leftTable: true,
		leftPropertyName: true,
		leftLabel: true,
		leftFkName: true,
		leftTemplate: true,
		rightColumn: true,
		rightTable: true,
		rightPropertyName: true,
		rightLabel: true,
		rightTemplate: true,
		onDelete: true,
	})
	.extend({ rightPkType: z.string(), type: z.enum(["many-to-one", "owner-one-to-one"]) })

export type JunctionRelationCreateDto = NotNil<
	Omit<
		RelationCreateDto,
		| "type"
		| "onDelete"
		// This are added bellow
		| "leftTemplate"
		| "rightTemplate"
		| "junctionLeftTemplate"
		| "junctionRightTemplate"
	>
> & {
	type: "many-to-many"
	leftPkType: string
	rightPkType: string
} & Required<
		Pick<
			RelationCreateDto,
			"leftTemplate" | "rightTemplate" | "junctionLeftTemplate" | "junctionRightTemplate"
		>
	>
