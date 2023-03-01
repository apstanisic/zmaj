import { z } from "zod"

const DropdownValue = z.union([z.string(), z.number(), z.boolean(), z.date()])

export const DropdownChoices = z.array(
	z.object({ value: DropdownValue, label: z.string().optional() }),
)

const refineMinMax = (config: { min?: number; max?: number }): string | undefined => {
	if (config.min === undefined || config.max === undefined) return
	if (config.min > config.max) return "Min value must be less then or equal to max value"
	return
}
export const CommonTextConfigSchema = z.object({
	/** Min string length */
	minLength: z.number().int().min(0).max(10_000_000).optional(),
	/** Max string length */
	maxLength: z.number().int().min(0).max(10_000_000).optional(),
	/** Regular expression */
	regex: z.union([z.string().transform((v) => new RegExp(v)), z.instanceof(RegExp)]).optional(),
	/** Regex Error message */
	regexError: z.string().max(300).optional(),
})
/**
 * Text area is different from long-text
 */

export const FieldConfigSchema = z
	.object({
		/**
		 * How wide is this field in GUI
		 */
		width: z.number().int().min(1).max(12).default(12).optional(),
		/**
		 * Hide in list view
		 */
		listHidden: z.boolean().default(false).optional(),
		/**
		 * Hide in edit view
		 */
		editHidden: z.boolean().default(false).optional(),
		/**
		 * Hide in show view
		 */
		showHidden: z.boolean().default(false).optional(),
		/**
		 * Hide in create view */
		createHidden: z.boolean().default(false).optional(),

		/**
		 * Syntax language
		 * Used for 'code'
		 */
		component: z
			.object({
				dropdown: z.object({ choices: DropdownChoices.optional() }).optional(),

				// `showRelative` - for example "3 hours ago"
				dateTime: z.object({ showRelative: z.boolean().optional() }).optional(),

				uuid: z.object({ version: z.number().min(1).max(8).optional() }).optional(),

				float: z
					.object({
						min: z.number().finite().optional(),
						max: z.number().finite().optional(),
						step: z.number().finite().optional(),
					})
					.refine(refineMinMax)
					.optional(),

				int: z
					.object({
						min: z.number().int().finite().optional(),
						max: z.number().int().finite().optional(),
						step: z.number().int().finite().optional(),
					})
					.refine(refineMinMax)
					.optional(),

				code: CommonTextConfigSchema.extend({
					syntaxLanguage: z.string().min(1).max(50).optional(),
				}).optional(),

				textarea: CommonTextConfigSchema.extend({
					// how many rows to display
					rows: z.number().int().min(1).max(50).default(6).optional(),
				}).optional(),

				url: CommonTextConfigSchema.optional(),

				richText: CommonTextConfigSchema.optional(),

				"short-text": CommonTextConfigSchema.optional(),

				"long-text": CommonTextConfigSchema.optional(),

				markdown: CommonTextConfigSchema.optional(),

				email: CommonTextConfigSchema.optional(),

				password: CommonTextConfigSchema.optional(),

				json: CommonTextConfigSchema.optional(),
			})
			.catchall(z.unknown())
			.optional(),
	})
	.catch(() => ({
		createHidden: false,
		editHidden: false,
		listHidden: false,
		showHidden: false,
		width: 12,
	}))
