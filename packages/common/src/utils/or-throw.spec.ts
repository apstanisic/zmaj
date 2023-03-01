import { describe, expect, expectTypeOf, it } from "vitest"
import { orThrow } from "./or-throw"

describe("orThrow", () => {
	const errStub = new Error()

	it("should throw if value is null or undefined", () => {
		expect(() => orThrow(undefined, errStub)).toThrow(errStub)
		expect(() => orThrow(null, errStub)).toThrow(errStub)
		expect(orThrow(55, errStub)).toEqual(55)
	})

	it("should support not passing error", () => {
		expect(() => orThrow(undefined)).toThrow(Error)
	})

	it("should support passing string as error", () => {
		try {
			orThrow(undefined, "hello")
		} catch (error: any) {
			expect(error.message).toEqual("hello")
		}
	})

	it("should remove undefined and null", () => {
		expectTypeOf(orThrow("hello world", errStub)).toMatchTypeOf<string>()
		expectTypeOf(orThrow({ test: "me" }, errStub)).toMatchTypeOf<{ test: string }>()
		expectTypeOf(orThrow("hello world", errStub)).not.toBeUndefined()
		expectTypeOf(orThrow("hello world", errStub)).not.toBeNull()
	})
})
