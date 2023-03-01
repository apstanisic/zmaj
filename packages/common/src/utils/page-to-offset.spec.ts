import { pageToOffset } from "./page-to-offset"

import { it, expect, describe } from "vitest"

describe("pageToOffset", () => {
	it("should convert page to offset", () => {
		expect(pageToOffset(3, 30)).toBe(60)
		expect(pageToOffset(1, 10)).toBe(0)
		expect(pageToOffset(10, 20)).toBe(180)
	})

	it("should prevent negative values", () => {
		expect(pageToOffset(-3, 30)).toBe(0)
	})
})
