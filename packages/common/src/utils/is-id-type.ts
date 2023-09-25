import { IdType } from "@zmaj-js/orm"
import { isInt, isString } from "radash"
import { isUUID } from "./is-uuid"

/**
 * Check if value can be ID
 *
 * @param value
 * @returns `true` if it's valid ID, `false` otherwise
 */
export function isIdType(value: unknown): value is IdType {
	if (isInt(value) && (value as number) > 0) return true
	if (isString(value) && isUUID(value)) return true
	return false
	// return typeof value === "string" || typeof value === "number"
}
