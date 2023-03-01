import { intRegex } from "../regexes"

/**
 * Check if provided string is valid integer
 *
 * @param value Value to check
 * @returns `true` if value is int, `false` otherwise
 */

export function isIntString(value: string): boolean {
	if (typeof value !== "string") return false
	return intRegex.test(String(value))
}
