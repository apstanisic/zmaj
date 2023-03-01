import { WritableDeep } from "type-fest"

export function makeWritable<T>(val: T): WritableDeep<T> {
	return val as WritableDeep<T>
}
