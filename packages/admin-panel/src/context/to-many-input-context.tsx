import { ToManyInputContext } from "../types/ToManyContext"
import { generateContext } from "../utils/generate-context"

/**
 * Separate in multiple contexts
 */
export const [ToManyInputContextProvider, useToManyInputContext] =
	generateContext<ToManyInputContext>(
		undefined,
		{ throwOnNil: true }, //
	)
