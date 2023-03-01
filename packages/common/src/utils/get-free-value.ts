import { v4 } from "uuid"

/**
 *
 * @param value Value to check
 * @param fn Function to check if value is free. Should return `true` if value is free
 * @param between string to be added between value and number
 * @returns first free value
 */

export function getFreeValue(
	value: string,
	fn: (v: string) => boolean,
	between: string = "",
): string {
	let valueToCheck = value
	let free = fn(valueToCheck)
	let i = 1

	while (!free) {
		// prevents infinite loop. If invalid x times, simply append uuid, that it will always be unique
		if (i > 10000) return value + between + v4()
		valueToCheck = value + between + i
		free = fn(valueToCheck)
		i++
	}
	return valueToCheck
}
