import { asMock } from "./as-mock"

import { it, expect, describe } from "vitest"

describe("asMock", () => {
	it("should not change any data", () => {
		const refObject = {}
		expect(asMock(refObject)).toBe(refObject)
	})
})
