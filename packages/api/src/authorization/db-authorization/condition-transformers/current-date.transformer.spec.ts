import { InternalServerErrorException } from "@nestjs/common"
import { addDays } from "date-fns"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { currentDateTransformer } from "./current-date.transformer"

describe("currentDateTransformer", () => {
	let mockNow: Date

	beforeEach(() => {
		// use fixed date, since tests throw when daylight saving time is changed
		mockNow = new Date("2023-02-23T17:26:00.319Z")
		vi.useFakeTimers({ now: mockNow })
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it("should have key current date", () => {
		expect(currentDateTransformer.key).toBe("CURRENT_DATE")
	})

	describe("transform", () => {
		it("should return current date if modifier is not provided", () => {
			const res = currentDateTransformer.transform({ modifier: undefined })
			expect(res).toEqual(mockNow)
		})

		it("should add duration if modifier is specified", () => {
			const res = currentDateTransformer.transform({ modifier: "3d" })
			expect(res).toEqual(addDays(mockNow, 3))
		})

		it("should throw if invalid modifier is specified", () => {
			expect(() => currentDateTransformer.transform({ modifier: "07jj9" })).toThrow(
				InternalServerErrorException,
			)
		})
	})
})
