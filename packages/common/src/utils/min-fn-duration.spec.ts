import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { asMock } from "./as-mock"
import { minFnDuration } from "./min-fn-duration"
import { sleep } from "./sleep"

vi.mock("./sleep", () => ({
	sleep: vi.fn(), //.mockImplementation((ms) => vi.advanceTimersByTime(ms)),
}))

describe("minFnDuration", () => {
	beforeEach(() => {
		vi.useFakeTimers()
		asMock(sleep).mockImplementation((ms) => vi.advanceTimersByTime(ms))
	})

	afterEach(() => {
		vi.useRealTimers()
		// i do not know why i need to call this, but without this last test fails
		// there is already  `restoreMocks: true` in vi config
		// vi.clearAllMocks()
	})

	it("should enforce min duration of function", async () => {
		await minFnDuration(3000, async () => sleep(1000))
		expect(sleep).toBeCalledTimes(2)
		expect(sleep).nthCalledWith(1, 1000)
		expect(sleep).nthCalledWith(2, 2000)
		// await minFnDuration(3000, async () => sleep(1000))
		// expect(sleep).toBeCalledTimes(2)
		// expect(sleep).nthCalledWith(1, 1000)
		// expect(sleep).nthCalledWith(2, 2000)
	})

	// it("should not wait if fn takes longer then min time", async () => {
	// 	await minFnDuration(3000, async () => sleep(4000))
	// 	expect(sleep).toBeCalledTimes(1)
	// })
})
