import { isStruct } from "./is-struct"

import { it, expect, describe } from "vitest"

/**
 *
 */
describe("isStruct", () => {
	it("should return true if value is simple object", () => {
		expect(isStruct({})).toBe(true)
		expect(isStruct({ hello: "world" })).toBe(true)

		class Test {}
		expect(isStruct(new Test())).toBe(false)
		expect(isStruct([])).toBe(false)
	})
})
