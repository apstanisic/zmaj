import { v4 } from "uuid"
import { isIdType } from "./is-id-type"

import { it, expect, describe } from "vitest"

describe("isIdType", () => {
	it("should return `true` if it is valid id value", () => {
		expect(isIdType(5)).toBe(true)
		expect(isIdType(v4())).toBe(true)
		//
		expect(isIdType("5")).toBe(false)
		expect(isIdType("non_uuid")).toBe(false)
	})
})
