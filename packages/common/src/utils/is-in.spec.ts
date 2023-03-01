import { vi, beforeEach, it, expect, describe } from "vitest"
import { isIn } from "./is-in"

describe("isIn", () => {
	const mockArr = { includes: vi.fn() }
	beforeEach(() => {
		mockArr.includes.mockReturnValue("hello")
	})

	it("should check if value is in array", () => {
		const res = isIn(5, mockArr as any)
		expect(mockArr.includes).toBeCalledWith(5)
		expect(res).toEqual("hello")
	})
})
