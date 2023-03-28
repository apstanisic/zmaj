import { isFunction } from "radash"
import { z } from "zod"
import { AnyFn } from "./types"

type OverrideParam<T> = T extends z.ZodTypeAny
	? Partial<z.input<T>> | ((stub: z.output<T>) => z.output<T>)
	: Partial<T> | ((stub: T) => T)

type OverrideFn<T> = (override?: OverrideParam<T>) => T extends z.ZodTypeAny ? z.output<T> : T

export function Stub<T>(fn: () => T): OverrideFn<T>
export function Stub<T extends z.ZodTypeAny>(schema: T, fn: () => z.input<T>): OverrideFn<T>
export function Stub<T>(
	schemaOrFn: z.ZodTypeAny | AnyFn,
	fn?: () => z.input<z.ZodTypeAny>,
): OverrideFn<T> {
	//
	return (override?: OverrideParam<T>) => {
		const base = isFunction(schemaOrFn) ? schemaOrFn() : fn!()
		const full = isFunction(override) ? override(base) : { ...base, ...override }
		return !isFunction(schemaOrFn) ? schemaOrFn.parse(full) : full
	}
}
// ts complains
export type StubResult<T> = OverrideFn<T>
