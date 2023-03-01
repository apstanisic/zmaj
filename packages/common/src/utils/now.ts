/**
 * Get current date
 *
 * @example
 * ```js
 * const currentDate = now()
 * ```
 *
 * Useful for passing function as callback
 * ```js
 * // before
 * zod.date().defaultValue(() => new Date())
 * // after
 * zod.date().defaultValue(now)
 * ```
 * @returns Current date
 */

export function now(): Date {
	return new Date()
}
