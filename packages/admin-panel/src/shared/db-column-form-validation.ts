import { columnNameRegex, CommonTextConfigSchema, FieldConfig } from "@zmaj-js/common"
import { z } from "zod"

export const dbColumnValidation: z.infer<typeof CommonTextConfigSchema> = {
	regex: columnNameRegex,
	regexError: "Only letters, numbers and underscores in the middle allowed",
}

export const shortTextDbColumnValidation: FieldConfig = {
	component: {
		"short-text": {
			regex: columnNameRegex,
			regexError: "Only letters, numbers and underscores in the middle allowed",
		},
	},
}
