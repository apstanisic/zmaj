/**
 * Calculate percentage
 *
 * ```js
 * percent(20, 1000) === 2
 * percent(10, 50) === 20
 * percent(20) === 20
 * ```
 *
 * @param amount Amount that is percentage
 * @param total Amount possible
 * @returns Percentage value
 */
export function percent(amount: number, total: number = 100): number {
	return Math.ceil((amount / total) * 100)
}
