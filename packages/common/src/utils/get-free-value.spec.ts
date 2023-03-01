import { getFreeValue } from "./get-free-value"
import { isUUID } from "./is-uuid"

import { it, expect, describe } from "vitest"

describe("getFreeValue", () => {
	it("should get free value", () => {
		const val = getFreeValue("hello", (val) => val.endsWith("5"))
		expect(val).toEqual("hello5")
	})

	it("should allow custom separator", () => {
		const val = getFreeValue("hello", (val) => val.endsWith("5"), "__")
		expect(val).toEqual("hello__5")
	})

	it("should fallback to uuid if no value is possible", () => {
		const val = getFreeValue("hello", (val) => false)
		expect(val.substring(0, 5)).toBe("hello")
		expect(isUUID(val.substring(5))).toBe(true)
	})
})
