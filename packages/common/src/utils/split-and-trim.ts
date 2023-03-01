/**
 * Split string and trim every item in array
 *
 * @param val
 * @param separator
 * @returns Trimmed items
 */
export function splitAndTrim(val: string, separator: string = ","): string[] {
	return val
		.trim()
		.split(separator)
		.map((part) => part.trim())
		.filter((part) => part !== "")
}
