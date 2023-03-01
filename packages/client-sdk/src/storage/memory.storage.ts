import { Struct } from "@zmaj-js/common"
import { BaseStorage } from "./base-storage.type"

export class MemoryStorage implements BaseStorage {
	values: Struct<string | undefined> = {}
	getItem(key: string): string | null {
		return this.values[key] ?? null
	}
	setItem(key: string, val: string): void {
		this.values[key] = val
	}
	removeItem(key: string): void {
		this.values[key] = undefined
	}
}
