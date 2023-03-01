import { isPrimitiveDbValue } from "./is-primitive-db-value"

import { it, expect, describe } from "vitest"

describe("isPrimitiveDbValue", () => {
	it("should return `true` if value is simple db value", () => {
		expect(isPrimitiveDbValue(1)).toBe(true)
		expect(isPrimitiveDbValue(null)).toBe(true)
		expect(isPrimitiveDbValue("some_string")).toBe(true)
		expect(isPrimitiveDbValue(new Date())).toBe(true)
		expect(isPrimitiveDbValue(true)).toBe(true)

		//
		expect(isPrimitiveDbValue(undefined)).toBe(false)
		expect(isPrimitiveDbValue({})).toBe(false)
		expect(isPrimitiveDbValue([])).toBe(false)
	})
})
