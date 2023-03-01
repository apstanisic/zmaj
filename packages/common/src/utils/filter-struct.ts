import { Struct } from "@common/types"

export function filterStruct<T extends Struct<any>, R extends Partial<T> = Partial<T>>(
	data: T,
	fn: (value: T[keyof T], key: keyof T, i: number) => boolean,
): R {
	const entries = Object.entries(data)
	const filtered = entries.filter((kv, i) => fn(kv[1] as any, kv[0] as keyof T, i))
	return Object.fromEntries(filtered) as R
}

// filterStruct({ hello: "world", test: 5 }, (v, k) => {
//   //
//   return true
// })
