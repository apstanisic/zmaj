import { columnNameRegex } from "../regexes"

/**
 * Valid name for db column or table
 *
 * This is not all allowed names (quoting allows for any random name),
 * but when setting trough app, we require strict naming
 *
 * Must start with letter
 * Can contain only one underscore at the time
 * Must end with a letter or number
 *
 */
/**
 * Check if value is valid database column name
 */

export function isValidDbColumnName(val: unknown): val is string {
	if (typeof val !== "string") return false
	return columnNameRegex.test(val)
}
