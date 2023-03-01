/**
 * Check if value is one of the items.
 * IMO Prettier version of `arr.includes`, and more ts flexible
 * Lodash `includes` does not cast value
 */

export function isIn<T>(value: unknown, arr: readonly T[]): value is T {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return arr.includes(value as any)
}
