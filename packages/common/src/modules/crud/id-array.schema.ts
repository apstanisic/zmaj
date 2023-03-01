import { z } from "zod"

/**
 * This forces array to either be all one type or the other
 * Value can't be mixed (1,2,3 => good, 1, 'uuid', 5 => bad)
 */
export const IdArraySchema = z.union([
	z.array(z.string().uuid()),
	z.array(z.number().int().min(1)), //,
])
