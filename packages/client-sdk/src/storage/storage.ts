import { BaseStorage } from "./base-storage.type"
import { LocalStorage } from "./local.storage"
import { MemoryStorage } from "./memory.storage"

export class SdkStorage implements BaseStorage {
	instance: BaseStorage
	constructor() {
		this.instance = globalThis?.window?.localStorage ? new LocalStorage() : new MemoryStorage()
	}

	getItem(key: string): string | null {
		return this.instance.getItem(key) ?? null
	}

	setItem(key: string, val: string): void {
		this.instance.setItem(key, val)
	}

	removeItem(key: string): void {
		this.instance.removeItem(key)
	}
}

export const storage = new SdkStorage()
