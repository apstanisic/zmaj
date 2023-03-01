import { InternalServerErrorException } from "@nestjs/common"
import { addDays } from "date-fns"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { currentDateTransformer } from "./current-date.transformer"

describe("currentDateTransformer", () => {
	let now: Date

	beforeEach(() => {
		now = new Date()
		vi.useFakeTimers({ now })
		// vi.setSystemTime(now)
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
			expect(res).toEqual(now)
		})

		it("should add duration if modifier is specified", () => {
			const res = currentDateTransformer.transform({ modifier: "3d" })
			expect(res).toEqual(addDays(now, 3))
		})

		it("should throw if invalid modifier is specified", () => {
			expect(() => currentDateTransformer.transform({ modifier: "07jj9" })).toThrow(
				InternalServerErrorException,
			)
		})
	})
})
