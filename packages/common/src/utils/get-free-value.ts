import { range } from "radash"
import { v4 } from "uuid"

/**
 *
 * @param value Value to check
 * @param isFree Function to check if value is free. Should return `true` if value is free
 * @param between string to be added between value and number
 * @returns first free value
 */

export function getFreeValue(
	value: string,
	isFree: (v: string) => boolean,
	options: { between?: string; times?: number } = {},
): string {
	const { between = "", times = 30 } = options
	if (isFree(value)) return value

	for (const i of range(1, times + 1)) {
		//
		const joined = value + between + i
		if (isFree(joined)) return joined
	}
	return value + between + v4().substring(24)
}
