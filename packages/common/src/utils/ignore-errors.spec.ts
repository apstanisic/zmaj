import { ignoreErrors } from "./ignore-errors"

import { it, expect, describe } from "vitest"

describe("ignoreErrors", () => {
	it("should ignore errors in sync function", () => {
		expect(
			ignoreErrors(() => {
				throw new Error()
			}),
		).toBeUndefined()
	})

	it("should return normally if function did not throw", () => {
		expect(ignoreErrors(() => 5)).toBe(5)
	})
})
