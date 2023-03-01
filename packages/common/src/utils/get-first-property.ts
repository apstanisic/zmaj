/**
 * Get first property from object
 *
 * Useful for parsing mongo like query
 * ```js
 * const filter = {
 *   user: { eq: 'Test' }
 * }
 * const [comparison, value] = getFirstProperty(filter.users)
 * assert(comparison === 'eq')
 * assert(value === 'Test')
 *
 * ```
 * @param obj to get value
 * @returns first property from object as tuple
 */

export function getFirstProperty<T>(obj: Record<string, T>): [key: string, value: T] | undefined {
	return Object.entries(obj)[0]
	// return toPairs(obj)[0]
}

export function getFirstKey<T>(obj: Record<string, T>): string | undefined {
	return Object.keys(obj)[0]
}
