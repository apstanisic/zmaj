/**
 * Convert throw from statement to expression
 *
 * This is a simple helper, and it allows some pretty things like
 * ```js
 * let id = data.id ?? throwErr(new Error('Invalid'))
 * let id = arr.find(item => item.name === 'test') ?? throwErr()
 * ```
 * @param error Error to throw
 * @throws Provided error, otherwise empty `Error`
 *
 * Until proposal is implemented
 * @see https://github.com/tc39/proposal-throw-expressions/issues/13
 */

export function throwErr(error?: Error | string): never {
	const err = error instanceof Error ? error : new Error(error)
	throw err
}
