import { beforeEach, describe, expect, it } from "vitest"
import { ParseStringPipe } from "./parse-string.pipe"

describe("ParseStringPipe", () => {
	let pipe: ParseStringPipe
	beforeEach(() => {
		pipe = new ParseStringPipe()
	})

	describe("transform", () => {
		it("should convert value to string", () => {
			expect(pipe.transform(123)).toBe("123")
			expect(pipe.transform("hello")).toBe("hello")
		})

		it("should properly handle objects", () => {
			expect(pipe.transform({})).toBe("{}")
			expect(pipe.transform({})).not.toBe("[object Object]")
		})
	})
})
