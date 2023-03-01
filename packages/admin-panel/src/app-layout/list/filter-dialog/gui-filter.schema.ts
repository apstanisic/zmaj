import { getFirstProperty } from "@zmaj-js/common"
import { z } from "zod"
import { allComparisons } from "../../../field-components/all-comparisons"
import { GuiComparison } from "../../../field-components/types/CrudComponentDefinition"

const SingleComparison = z
	.record(
		z.enum(allComparisons),
		z.unknown(), //
	)
	.refine((record) => Object.keys(record).length === 1) //
	.transform((record) => {
		const [comparison, value] = getFirstProperty(record)!
		return { comparison: comparison as GuiComparison, value }
	})

export const GuiFilterSchema = z
	.object({
		$and: z.array(
			z
				.record(SingleComparison)
				.refine((record) => Object.keys(record).length === 1)
				.transform((record) => {
					const [field, compAndValue] = getFirstProperty(record)!
					return { ...compAndValue, field }
				}),
		),
	})
	.strict()

export type GuiFilter = z.infer<typeof GuiFilterSchema>
