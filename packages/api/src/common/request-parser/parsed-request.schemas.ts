import { jsonDateRegex, SEPARATOR, Struct } from "@zmaj-js/common"
import flat from "flat"
import { isString, mapValues } from "radash"
import { z } from "zod"

const { flatten, unflatten } = flat
export const ValidBodySchema = z.record(z.unknown()).default({}).transform(hydrateDate)
export const ValidParamsSchema = z.record(z.string().trim().min(1).max(200))
export const ValidQuerySchema = z.record(z.unknown())

//
// convert string date to Date object in body
function hydrateDate(values: Struct): Struct {
	const flat = flatten<Struct, Struct>(values, { delimiter: SEPARATOR })
	const hydrated = mapValues(flat, (val) => {
		if (!isString(val)) return val
		return jsonDateRegex.test(val) ? new Date(val) : val
	})
	return unflatten(hydrated, { delimiter: SEPARATOR })
}
