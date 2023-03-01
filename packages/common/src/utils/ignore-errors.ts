/**
 * Execute function and ignore all the errors
 *
 * @example
 * ```js
 * const jsonResult = ignoreErrors(() => JSON.parse(unknownValue))
 *
 * ```
 *
 * @param cb Function that should be executed. Function must be sync
 * @returns Returned value or nothing if throws
 */

export function ignoreErrors<T>(cb: () => T): T | undefined {
	try {
		const res = cb()
		return res
	} catch (error) {
		return
	}
}
