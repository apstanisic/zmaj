import { isIntString } from "./is-int-string"

import { it, expect, describe } from "vitest"

describe("isIntString", () => {
	it("should return `true` if value is int string", () => {
		//
		expect(isIntString("5")).toBe(true)
		expect(isIntString("5.5")).toBe(false)
		expect(isIntString("1000005.5")).toBe(false)
		expect(isIntString("hello.world")).toBe(false)
		expect(isIntString("false")).toBe(false)
		expect(isIntString(false as never)).toBe(false)
		expect(isIntString(1000005.5 as never)).toBe(false)
		expect(isIntString(1000005 as never)).toBe(false)
		//
	})
})
