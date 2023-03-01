import { Struct } from "@common/types/struct.type"
import { isEmpty } from "radash"
import { isStruct } from "./is-struct"

/**
 * Join filters to form mongo query. It will flatten nested $and filters
 *
 * @param filters Filters to join
 * @returns joined filters
 */
export function joinFilters(...filters: unknown[]): Struct | undefined {
	const nonEmpty: Struct[] = []
	for (const filter of filters) {
		if (!isStruct(filter) || isEmpty(filter)) continue

		// if it's already $and filter, we can simply put it at "our" $and filter
		if (Array.isArray(filter["$and"])) {
			const nested = joinFilters(...filter["$and"])
			//
			if (nested && Array.isArray(nested?.["$and"])) {
				nonEmpty.push(...nested["$and"])
			} else if (nested) {
				nonEmpty.push(nested)
			}
		} else {
			nonEmpty.push(filter)
		}
	}

	return nonEmpty.length < 2 ? nonEmpty[0] : { $and: nonEmpty }
}
