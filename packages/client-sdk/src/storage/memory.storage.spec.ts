import { beforeEach, describe, expect, it } from "vitest"
import { MemoryStorage } from "./memory.storage"

describe("memoryStorage", () => {
	let storage: MemoryStorage
	beforeEach(() => {
		storage = new MemoryStorage()
	})

	it("getItem", () => {
		storage["values"]["someKey"] = "hello"
		expect(storage.getItem("someKey")).toBe("hello")
	})

	it("setItem", () => {
		storage.setItem("someKey", "hello")
		expect(storage["values"]["someKey"]).toBe("hello")
	})

	it("removeItem", () => {
		storage["values"]["someKey"] = "hello"
		storage.removeItem("someKey")
		expect(storage["values"]["someKey"]).toBeUndefined()
	})
})
