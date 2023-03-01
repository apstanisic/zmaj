import { sub } from "date-fns"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { now } from "./now"

describe("now", () => {
	let date: Date

	beforeEach(() => {
		date = sub(new Date(), { days: 2, minutes: 15 })
		vi.useFakeTimers().setSystemTime(date)
	})

	afterEach(() => {
		vi.useRealTimers()
	})
	it("should return current time", () => {
		expect(now()).toEqual(date)
	})
})
