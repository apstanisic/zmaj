import { getFreeValue } from "./get-free-value"

import { describe, expect, it } from "vitest"

describe("getFreeValue", () => {
	it("should get free value", () => {
		const val = getFreeValue("hello", (val) => val.endsWith("5"))
		expect(val).toEqual("hello5")
	})

	it("should allow custom separator", () => {
		const val = getFreeValue("hello", (val) => val.endsWith("5"), { between: "__" })
		expect(val).toEqual("hello__5")
	})

	it("should fallback to random part of uuid if no value is possible", () => {
		const val = getFreeValue("hello", (val) => false)
		expect(val.substring(0, 5)).toBe("hello")
		expect(val.length).toEqual(17)
	})
})
