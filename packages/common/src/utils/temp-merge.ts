import { isStruct } from "./is-struct"

/**
 * Taken mostly the same
 * https://github.com/rayepps/radash/blob/7c6b986d19c68f19ccf5863d518eb19ec9aa4ab8/src/object.ts#L271
 */
export const merge = <X extends Record<string | symbol | number, any>>(
	initial: X,
	override: X,
): X => {
	if (!initial || !override) return initial ?? override ?? {}

	return Object.entries({ ...initial, ...override }).reduce((acc, [key, value]) => {
		return {
			...acc,
			[key]: (() => {
				if (isStruct(initial[key])) return merge(initial[key], value)
				// if (isArray(value)) return value.map(x => assign)
				// return value === undefined ? initial[key] : value
				return value
			})(),
		}
	}, {} as X)
}

export const mergeMany = <X extends Record<string | symbol | number, any>>(...values: X[]): X => {
	return values.reduce((v1, v2) => merge(v1, v2))
}
