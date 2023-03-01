import { percent } from "./percent"

import { it, expect, describe } from "vitest"

describe("percent", () => {
	it("should return percent based on params", () => {
		//
		expect(percent(50, 100)).toBe(50)
		expect(percent(20, 200)).toBe(10)
		expect(percent(40, 200)).toBe(20)
		expect(percent(5, 10)).toBe(50)
		expect(percent(7, 28)).toBe(25)
	})

	it("should default total to 100", () => {
		expect(percent(50)).toBe(50)
		expect(percent(200)).toBe(200)
	})
})
