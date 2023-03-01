import { getFirstProperty } from "./get-first-property"

import { it, expect, describe } from "vitest"

describe("getFirstProperty", () => {
	it("should get first property", () => {
		const val = { pr1: 5, pr2: 7 }
		expect(getFirstProperty(val)).toEqual(["pr1", 5])
	})

	it("should return undefined if object is empty", () => {
		const val = {}
		expect(getFirstProperty(val)).toBeUndefined()
	})
})
