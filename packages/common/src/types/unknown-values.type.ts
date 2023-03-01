/**
 * Used in testing, to ensure all fields are specified
 */
export type UnknownValues<T> = {
	[key in keyof T]: unknown
}
