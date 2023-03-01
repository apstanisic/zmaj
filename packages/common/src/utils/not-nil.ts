/**
 * Check if value is not `null` or `undefined`
 *
 * Useful for filtering and TypeScript inference:
 * @example
 * ```ts
 * // must pass function directly
 * const arr: number[] =[1, 2, null].filter(notNil)
 * // without
 * const arr2: number | undefined[] =[1, 2, null].filter(v => !isNil(v))
 * const arr3: number | undefined[] =[1, 2, null].filter(v => notNil(v))
 * ```
 * @param value Value to check
 * @returns `true` if value is defined, and cast strip `null` and `undefined` types from value
 */

import { isNil } from "./lodash"

export function notNil<T>(value: T | undefined | null): value is T {
	return !isNil(value)
}
