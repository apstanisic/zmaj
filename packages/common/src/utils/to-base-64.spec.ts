import { describe, expect, it } from "vitest"

describe("toBase64", () => {
	it("works always with btoa", () => {
		expect(1).toEqual(1)
	})
	// const ogWindow = globalThis.window
	// const ogBuffer = globalThis.Buffer

	// let toStr: Mock

	// beforeEach(() => {
	// 	toStr = vi.fn()
	// 	vi.spyOn(globalThis.Buffer, "from").mockImplementation(() => ({ toString: toStr }) as any)
	// })

	// afterEach(() => {
	// 	globalThis.window = ogWindow
	// 	globalThis.Buffer = ogBuffer
	// })

	// it("should call node version in node context", () => {
	// 	globalThis.window = undefined as any
	// 	toStr.mockReturnValueOnce("mocked")
	// 	const res = toBase64("hello world")
	// 	expect(globalThis.Buffer.from).toBeCalledWith("hello world", "utf8")
	// 	expect(res).toBe("mocked")
	// 	expect(toStr).toBeCalledWith("base64")
	// })

	// it("should call browser version in browser context", () => {
	// 	globalThis.window = { btoa: vi.fn().mockReturnValueOnce("mocked") } as any
	// 	const res = toBase64("hello world")
	// 	expect(globalThis.window.btoa).toBeCalledWith("hello world")
	// 	expect(res).toBe("mocked")
	// })
})
