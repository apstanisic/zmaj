/**
 * Check if provided index is last item in array
 *
 * It's a simple helper to help code readability
 * @example
 * ```js
 * const isLast1 = isLastIndex([1,2,3,4], 3) // true
 * const isLast2 = isLastIndex([1,2,3,4], 2) // true
 * ```
 *
 * @returns `true` if it's last
 */

export function isLastIndex<T>(arr: T[], index: number): boolean {
	return arr.length - 1 === index
}
