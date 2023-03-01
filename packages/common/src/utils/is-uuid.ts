import { uuidRegex } from "../regexes"

/**
 * Check if value is valid UUID
 */

export function isUUID(value: unknown): value is string {
	return uuidRegex.test(String(value))
}
