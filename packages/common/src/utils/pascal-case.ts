import { pascal } from "radash"
import { snakeCase } from "./lodash"

/**
 * Convert value to pascal case
 *
 * @example
 * ```js
 * const cased = pascalCase("HELLO_WORLD") // HelloWorld
 * const cased = pascalCase("testMe") // TestMe
 *
 * ```
 *
 * @param value Value to convert to pascal case
 * @returns Pascal cased value
 */
export function pascalCase(value: string): string {
	// return camel(value)
	// does not convert camelCase to PascalCase, it does this: Onetwo
	return pascal(snakeCase(value))
	// return upperFirst(camelCase(value))
}
