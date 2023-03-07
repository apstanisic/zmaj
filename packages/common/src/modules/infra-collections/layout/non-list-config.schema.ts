import { z } from "zod"

// export const ShowConfigSchema = NonListConfigSchema

const sections = z
	.object({
		// If null, do not show
		unsortedFieldsSection: z.string().nullish().default("Other"),
		sections: z.array(
			z.object({
				name: z.string(),
				label: z.string().optional(),
				fields: z.array(z.string()),
			}),
		),
	})
	.optional()

export type LayoutConfigSections = z.infer<typeof sections>

export const ShowConfigSchema = z.object({
	type: z.enum(["simple", "tabs"]).default("simple"),
	layouts: z
		.object({
			simple: z.object({ fields: z.array(z.string()).optional() }).optional(),
			tabs: sections,
		})
		.optional(),
})

const edit = z
	.object({
		type: z.enum(["simple", "tabs", "steps"]).default("simple"),
		reuseCreate: z.boolean().default(false).catch(false),
		simple: z.object({ fields: z.array(z.string()).optional() }).optional(),
		tabs: sections,
		steps: sections,
	})
	.optional()

const create = z
	.object({
		type: z.enum(["simple", "tabs", "steps"]).default("simple"),
		simple: z.object({ fields: z.array(z.string()).optional() }).optional(),
		tabs: sections,
		steps: sections,
	})
	.optional()

export const InputConfigSchema = z
	.object({
		edit,
		create,
	})
	.transform((val) => {
		if (val.edit?.reuseCreate) {
			val.edit = structuredClone({
				...val.create,
				reuseCreate: true,
				type: val.create?.type ?? "simple",
			})
		}
		return val
	})
