import { vi, beforeEach, afterEach, it, expect, describe } from "vitest"
import { sleep } from "./sleep"

describe("sleep", () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.spyOn(global, "setTimeout")
		vi.clearAllTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})
	it("should sleep for x seconds", async () => {
		const promise = sleep(5000)
		vi.advanceTimersByTime(10000)
		const res = await promise
		expect(setTimeout).toBeCalledWith(expect.any(Function), 5000)
		expect(res).toBeUndefined()
	})
})
