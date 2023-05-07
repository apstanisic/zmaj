/**
 * Strips wrapper types
 *
 * When returned type has something like
 * ```ts
 * type A = {
 *   id: SomeWrapper<SomeOther<string>>
 * } & {
 *   name: SomeWrapper<SomeOther<string>>
 * }
 * ```
 * this should convert it to
 * ```ts
 * type A = { id: string; name: string }
 * ```
 */
export type StripWrapperTypes<T> = {
	[key in keyof T]: T[key]
}
