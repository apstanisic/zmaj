import { FLAT_DELIMITER, Struct } from "@zmaj-js/common"
import flat from "flat"
import { isDate } from "radash"

const { flatten, unflatten } = flat

export function fixTestDate<T>(obj: T): {
	[key in keyof T]: T[key] extends Date | undefined | null ? string : T[key]
} {
	// const cloned = cloneDeep(obj)
	if (Array.isArray(obj)) return obj.map((row) => fixTestDate(row)) as any
	const cloned = flatten<any, Struct>(obj, { delimiter: FLAT_DELIMITER })
	for (const [key, val] of Object.entries(cloned)) {
		if (isDate(val)) {
			cloned[key] = val.toJSON() as any
		}
	}
	return unflatten(cloned, { delimiter: FLAT_DELIMITER }) as any
}
