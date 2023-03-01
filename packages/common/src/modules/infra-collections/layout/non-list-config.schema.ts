import { merge } from "@common/utils/temp-merge"
import { omit } from "radash"
import { z } from "zod"

const UnsortedFieldsSection = z.union([z.string(), z.literal(false)]).default("Other")

const FieldLayoutConfig = z
	.discriminatedUnion("type", [
		z.object({
			type: z.literal("sections"),
			unsortedFieldsSection: UnsortedFieldsSection,
			sections: z.array(
				z.object({
					name: z.string(),
					fields: z.array(z.string()),
					label: z.string().optional(),
				}),
			),
		}),
		z.object({
			type: z.literal("direct"),
			unsortedFieldsSection: UnsortedFieldsSection,
			fields: z.array(z.string()),
		}),
		z.object({ type: z.literal("default") }),
	])
	.default({ type: "default" })

/**
 * Shared between create, update, show
 */
const NonListConfigSchema = z.object({
	layoutType: z.string().min(1).max(100).default("simple"),
	fieldsLayout: FieldLayoutConfig.default({ type: "default" }),
})

export const ShowConfigSchema = NonListConfigSchema

export const InputConfigSchema = NonListConfigSchema.extend({
	edit: NonListConfigSchema.optional(),
	create: NonListConfigSchema.optional(),
}).transform((v): Record<"edit" | "create", z.infer<typeof NonListConfigSchema>> => {
	const shared = omit(v, ["edit", "create"])
	return {
		edit: v.edit ? merge(v.edit, shared) : { ...shared },
		create: v.edit ? merge(v.edit, shared) : { ...shared },
	}
})
