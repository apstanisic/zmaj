import { isNil } from "@common/utils/lodash"
import { z } from "zod"

const DropdownValue = z.union([z.string(), z.number(), z.boolean(), z.date()])

export const DropdownChoices = z.array(
	z.object({ value: DropdownValue, label: z.string().optional() }),
)

const refineMinMax = (config: { min?: number | null; max?: number | null }): string | undefined => {
	if (isNil(config.min) || isNil(config.max)) return
	if (config.min > config.max) return "Min value must be less then or equal to max value"
	return
}
export const CommonTextConfigSchema = z.object({
	/** Min string length */
	minLength: z.number().int().min(0).max(10_000_000).nullish(),
	/** Max string length */
	maxLength: z.number().int().min(0).max(10_000_000).nullish(),
	/** Regular expression */
	regex: z.union([z.string().transform((v) => new RegExp(v)), z.instanceof(RegExp)]).nullish(),
	/** Regex Error message */
	regexError: z.string().max(300).nullish(),
})
/**
 * Text area is different from long-text
 */

export const FieldConfigSchema = z
	.object({
		/**
		 * How wide is this field in GUI
		 */
		width: z.number().int().min(1).max(12).default(12).nullish(),
		/**
		 * Hide in list view
		 */
		listHidden: z.boolean().default(false).nullish(),
		/**
		 * Hide in edit view
		 */
		editHidden: z.boolean().default(false).nullish(),
		/**
		 * Hide in show view
		 */
		showHidden: z.boolean().default(false).nullish(),
		/**
		 * Hide in create view */
		createHidden: z.boolean().default(false).nullish(),

		/**
		 * Syntax language
		 * Used for 'code'
		 */
		component: z
			.object({
				dropdown: z.object({ choices: DropdownChoices.nullish() }).nullish(),

				// `showRelative` - for example "3 hours ago"
				dateTime: z.object({ showRelative: z.boolean().nullish() }).nullish(),

				uuid: z.object({ version: z.number().min(1).max(8).nullish() }).nullish(),

				float: z
					.object({
						min: z.number().finite().nullish(),
						max: z.number().finite().nullish(),
						step: z.number().finite().nullish(),
					})
					.refine(refineMinMax)
					.nullish(),

				int: z
					.object({
						min: z.number().int().finite().nullish(),
						max: z.number().int().finite().nullish(),
						step: z.number().int().finite().nullish(),
					})
					.refine(refineMinMax)
					.nullish(),

				code: CommonTextConfigSchema.extend({
					syntaxLanguage: z.string().min(1).max(50).nullish(),
				}).nullish(),

				textarea: CommonTextConfigSchema.extend({
					// how many rows to display
					rows: z.number().int().min(1).max(50).default(6).nullish(),
				}).nullish(),

				url: CommonTextConfigSchema.nullish(),

				richText: CommonTextConfigSchema.nullish(),

				"short-text": CommonTextConfigSchema.nullish(),

				"long-text": CommonTextConfigSchema.nullish(),

				markdown: CommonTextConfigSchema.nullish(),

				email: CommonTextConfigSchema.nullish(),

				password: CommonTextConfigSchema.nullish(),

				json: CommonTextConfigSchema.nullish(),
			})
			.catchall(z.unknown())
			.nullish(),
	})
	.catch((_e) => ({
		createHidden: false,
		editHidden: false,
		listHidden: false,
		showHidden: false,
		width: 12,
	}))
