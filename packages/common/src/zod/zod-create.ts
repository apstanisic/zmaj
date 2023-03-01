import { z } from "zod"

/**
 * This is almost the same as doing `schema.parse` directly, but it provides types
 * for data params.
 *
 * @example
 * ```js
 * const user = zodCreate(UserSchema, { email: "test@example.com" })
 * ```
 *
 * @param schema Zod Schema. Support `.catch()` zod object
 * @param data Provided data
 * @returns valid data
 * @throws if data is invalid
 */
export function zodCreate<T extends z.ZodTypeAny>(
	schema: T,
	data: T extends z.ZodCatch<infer R> ? z.input<R> : z.input<T>,
): z.output<T> {
	return schema.parse(data)
}
