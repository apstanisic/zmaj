import { random } from "radash"
import { isLastIndex } from "./is-last-index"

import { describe, expect, it } from "vitest"
import { times } from "./lodash"

describe("isLastIndex", () => {
	it("should check if number is last index of array", () => {
		const arr = times(random(1, 100), (i) => i)
		// const arr = [1, 2, 3, 4, 5, 6]
		expect(isLastIndex(arr, arr.length - 1)).toBe(true)
		expect(isLastIndex(arr, arr.length)).toBe(false)
		expect(isLastIndex(arr, arr.length + 1)).toBe(false)
	})
})
