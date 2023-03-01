import { isEmail } from "./is-email"

import { describe, expect, it } from "vitest"

describe("isEmail", () => {
	it("should return `true` if value is email", () => {
		//
		expect(isEmail("valid@email.com")).toBe(true)
		expect(isEmail("invalid @ value.com")).toBe(false)
		expect(isEmail("invalid@value")).toBe(false)
	})
})
