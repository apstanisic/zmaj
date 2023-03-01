import { isValidDbColumnName } from "./is-valid-db-column-name"

import { it, expect, describe } from "vitest"

describe("isValidDbColumnName", () => {
	//
	it("should return `true` if value can be used as db column name", () => {
		expect(isValidDbColumnName("_hello")).toBe(false)
		expect(isValidDbColumnName("world_")).toBe(false)
		expect(isValidDbColumnName("5_test")).toBe(false)
		expect(isValidDbColumnName("dash-test")).toBe(false)
		expect(isValidDbColumnName("test_with_$_value")).toBe(false)
		expect(isValidDbColumnName(null as never)).toBe(false)
		//
		expect(isValidDbColumnName("test_1")).toBe(true)
		expect(isValidDbColumnName("testValue")).toBe(true)
	})
})
