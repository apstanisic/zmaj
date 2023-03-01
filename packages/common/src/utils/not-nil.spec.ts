import { notNil } from "./not-nil"

import { it, expect, describe } from "vitest"

describe("notNil", () => {
	it("should return true if value is defined", () => {
		expect(notNil("")).toBe(true)
		expect(notNil(123)).toBe(true)
		expect(notNil({})).toBe(true)
		expect(notNil([])).toBe(true)

		expect(notNil(null)).toBe(false)
		expect(notNil(undefined)).toBe(false)
	})
})
