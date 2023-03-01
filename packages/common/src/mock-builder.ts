import { draw, isFunction } from "radash"
import { throwErr } from "./utils/throw-err"

export abstract class MockBuilder<T> {
	//   abstract collection: CollectionDef<T>
	abstract mock(): T
	private item: T = this.mock()

	setValue<K extends keyof T>(field: K, value: T[K]): this {
		this.item[field] = value
		return this
	}

	setValues(values: Partial<T>): this {
		for (const [key, val] of Object.entries(values)) {
			this.item[key as keyof T] = val as any
		}
		return this
	}

	setRandom<K extends keyof T>(field: K, values: T[K][]): this {
		this.item[field] = draw(values) ?? throwErr("97423")
		return this
	}

	build(values?: Partial<T> | ((val: T) => void)): T {
		if (isFunction(values)) {
			values(this.item)
		} else if (typeof values === "object") {
			this.setValues(values)
		}

		return this.item
	}
}
