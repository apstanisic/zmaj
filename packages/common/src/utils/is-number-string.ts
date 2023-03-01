import { numberRegex } from "../regexes"

/**
 * Check if provided string is valid number
 *
 * @param value Value to check
 * @returns `true` if value is number, `false` otherwise
 */

export function isNumberString(value: string): boolean {
	if (typeof value !== "string") return false
	return numberRegex.test(value)
}
