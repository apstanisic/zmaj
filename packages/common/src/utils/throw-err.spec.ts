import { throwErr } from "./throw-err"

import { it, expect, describe } from "vitest"

class CustomError extends Error {}

describe("throwErr", () => {
	it("should throw error as a expressions", () => {
		expect(() => throwErr()).toThrow()
		expect(() => throwErr(new CustomError())).toThrow(CustomError)
	})
})
