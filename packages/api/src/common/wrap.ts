import { isPromise } from "node:util/types"

export type Wrapped<T> = T extends Promise<any> ? Promise<{ data: Awaited<T> }> : { data: T }

export function wrap<T>(data: T): Wrapped<T> {
	return isPromise(data) ? data.then((data) => ({ data })) : ({ data } as any)
}
