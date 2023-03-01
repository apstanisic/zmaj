import { isNumberString } from "./is-number-string"

import { it, expect, describe } from "vitest"

describe("isNumberString", () => {
	it("should return `true` if value is valid number string", () => {
		//
		expect(isNumberString("5")).toBe(true)
		expect(isNumberString("5.5")).toBe(true)
		expect(isNumberString("1000005.5")).toBe(true)
		expect(isNumberString("hello.world")).toBe(false)
		expect(isNumberString("false")).toBe(false)
		expect(isNumberString(false as never)).toBe(false)
		expect(isNumberString(1000005.5 as never)).toBe(false)
		expect(isNumberString(1000005 as never)).toBe(false)
	})
})
