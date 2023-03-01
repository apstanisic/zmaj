import { isNumber, isString } from "radash"

/**
 * Is item simple value from db or is array and object
 * This is used for checking if field is relation
 *
 * @param item Value from db
 * @returns true if value is simple DB value, and false if it's object or array
 */

export function isPrimitiveDbValue(item: unknown): item is string | boolean | number | null | Date {
	return (
		isString(item) ||
		typeof item === "boolean" ||
		isNumber(item) ||
		item === null ||
		item instanceof Date
	)
}
