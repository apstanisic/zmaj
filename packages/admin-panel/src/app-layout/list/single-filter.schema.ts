import { DbFieldSchema } from "@zmaj-js/common"
import { z } from "zod"
import { allComparisons } from "../../field-components/all-comparisons"

export const SingleFilterSchema = z.object({
	field: DbFieldSchema,
	comparison: z.enum(allComparisons),
	value: z.unknown(),
})
