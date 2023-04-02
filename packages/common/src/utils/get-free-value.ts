import { camel, range } from "radash"
import { v4 } from "uuid"
import { snakeCase } from "./lodash"

/**
 *
 * @param initialValue Value to check
 * @param isFree Function to check if value is free. Should return `true` if value is free
 * @param between string to be added between value and number
 * @returns first free value
 */

export function getFreeValue(
	initialValue: string,
	isFree: (v: string) => boolean,
	options: { times?: number; case?: "camel" | "snake" | "none"; caseInitial?: boolean } = {},
): string {
	const { times = 30, caseInitial = true } = options

	const caseFn =
		options.case === "camel" ? camel : options.case === "snake" ? snakeCase : (v: string) => v

	const value = caseInitial ? caseFn(initialValue) : initialValue

	if (isFree(value)) return value

	for (const i of range(1, times + 1)) {
		const joined = caseFn(value + i)
		if (isFree(joined)) return joined
	}

	return caseFn(initialValue + v4().substring(24))
}
