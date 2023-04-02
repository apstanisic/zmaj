import { getFreeValue } from "./get-free-value"

import { describe, expect, it } from "vitest"

describe("getFreeValue", () => {
	it("should get free value", () => {
		const val = getFreeValue("hello", (val) => val.endsWith("5"))
		expect(val).toEqual("hello5")
	})

	it("should use proper case", () => {
		expect(getFreeValue("hello", (val) => val.endsWith("5"), { case: "snake" })).toEqual("hello_5")
		expect(getFreeValue("hello", (val) => val.endsWith("5"), { case: "camel" })).toEqual("hello5")
	})

	it("should fallback to random part of uuid if no value is possible", () => {
		const val = getFreeValue("hello", () => false)
		expect(val.substring(0, 5)).toBe("hello")
		expect(val.length).toEqual(17)
	})
})
