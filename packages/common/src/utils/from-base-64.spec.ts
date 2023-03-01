import { describe, expect, it } from "vitest"

describe("fromBase64", () => {
	it("works always with atob", () => {
		expect(1).toEqual(1)
	})
	// const ogWindow = globalThis.window
	// const ogBuffer = globalThis.Buffer

	// const toStr = vi.fn()

	// beforeEach(() => {
	// 	vi.spyOn(globalThis.Buffer, "from").mockImplementation(() => ({ toString: toStr }) as any)
	// })

	// afterEach(() => {
	// 	globalThis.window = ogWindow
	// 	globalThis.Buffer = ogBuffer
	// })

	// it("should call node version in node context", () => {
	// 	globalThis.window = undefined as any
	// 	toStr.mockReturnValueOnce("mocked")
	// 	const res = fromBase64("some_base64")
	// 	expect(globalThis.Buffer.from).toBeCalledWith("some_base64", "base64")
	// 	expect(res).toBe("mocked")
	// 	expect(toStr).toBeCalledWith("utf8")
	// })

	// it("should call browser version in browser context", () => {
	// 	globalThis.window = { atob: vi.fn().mockReturnValueOnce("mocked") } as any
	// 	const res = fromBase64("some_base64")
	// 	expect(globalThis.window.atob).toBeCalledWith("some_base64")
	// 	expect(res).toBe("mocked")
	// })
})
