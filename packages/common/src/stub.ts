import { z } from "zod"
import { isStruct } from "./utils/is-struct"

export function stub<T>(
	defaultStubFn: (data: Partial<T>) => T,
	schema?: z.ZodType<T, any, any>,
): (data?: Partial<T>) => T {
	return (data?: Partial<T>) => {
		let res: T
		if (isStruct(data)) {
			res = defaultStubFn(data)
		} else {
			res = defaultStubFn({})
		}

		// Do not create new object, mutate already created
		// If we created instance of class, this can mess up with types
		for (const key of Object.keys(data ?? {})) {
			res[key as keyof T] = data?.[key as keyof T] as any
		}

		return schema ? schema.parse(res) : res
	}
}

export type StubType<T> = (data?: Partial<T>) => T
