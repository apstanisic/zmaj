/**
 * Sleep
 *
 * @example
 * ```js
 * async function example() {
 *   print('hey now')
 *   await sleep(5000)
 *   print('hey 5 seconds later')
 * }
 * ```
 * @param ms Duration in ms to sleep
 */

export async function sleep(ms: number): Promise<void> {
	return new Promise((res) => setTimeout(res, ms))
}
