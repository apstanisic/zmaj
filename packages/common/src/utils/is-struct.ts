import { isObject } from "radash"
import { Struct } from "../types"

/**
 * Check if value is plain object
 *
 * Lodash returns boolean, this is simply type guard
 * @param value Value to check
 * @returns `true` if struct, `false` otherwise
 */

export function isStruct(value: unknown): value is Struct {
	return isObject(value)
	// return isPlainObject(value)
}
