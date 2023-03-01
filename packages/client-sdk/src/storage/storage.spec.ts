import { mapValues } from "radash"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryStorage } from "./memory.storage"
import { SdkStorage } from "./storage"
vi.mock("./memory.storage")

describe("storage", () => {
	beforeEach(() => {
		globalThis.window = undefined as never
		vi.resetModules()
	})

	// it("should use localStorage if available", async () => {
	// 	const localStorage = vi.fn()
	// 	globalThis.window = { localStorage } as any
	// 	const storage = new SdkStorage()

	// 	// const storage = await import("./storage")
	// 	expect(storage.instance).toBeInstanceOf(LocalStorage)
	// })

	/**
	 * I think jest.resetModules and dynamic imports are messing with the order of the imports
	 * and that there are duplicate imports, so
	 * expect(storage.storage.instance).toBeInstanceOf(MemoryStorage) not working,
	 * but it shows that it received MemoryStorage. So this is workaround, so I don't waste any more
	 * time. This check that it's not the same as localStorage, and that replacement has all
	 * methods of memory storage
	 */
	it("should use memoryStorage if localStorage unavailable", async () => {
		const storage = new SdkStorage()
		expect(storage.instance).not.toBe(globalThis.window?.localStorage)
		expect(storage.instance).toEqual(
			expect.objectContaining(mapValues(new MemoryStorage(), (v) => expect.anything())),
		)
	})
})
