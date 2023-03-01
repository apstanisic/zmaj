import { throwErr } from "@zmaj-js/common"
import { BaseStorage } from "./base-storage.type"

type LocalStorageType = {
	getItem(key: string): string | null
	setItem(key: string, value: string): void
	removeItem(key: string): void
}

export class LocalStorage implements BaseStorage {
	storage: LocalStorageType
	constructor(adapter?: LocalStorageType) {
		this.storage = adapter ?? globalThis?.window?.localStorage ?? throwErr("79933")
	}
	getItem(key: string): string | null {
		return this.storage.getItem(key)
	}
	setItem(key: string, val: string): void {
		this.storage.setItem(key, val)
	}
	removeItem(key: string): void {
		this.storage.removeItem(key)
	}
}
