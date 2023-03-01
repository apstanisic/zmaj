import { jsonDateRegex } from "../regexes"
import { Struct } from "../types"

/**
 * Converts serialized date properties to `Date` object, other data is normally parsed
 * Only convert data if it's a string
 *
 * @param jsonString Response JSON as string
 * @returns Parsed JSON
 */

export function parseJsonWithDates(jsonString: string): Struct {
	return JSON.parse(jsonString, (_key: string, value: unknown) => {
		if (typeof value !== "string") return value
		if (jsonDateRegex.test(value)) return new Date(value)
		return value
	})
}
