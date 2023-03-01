import { splitAndTrim } from "./split-and-trim"

import { it, expect, describe } from "vitest"

describe("splitAndTrim", () => {
	it("should split value and trim every child", () => {
		const res = splitAndTrim(" hello,world , test , this   , func ")
		expect(res).toEqual(["hello", "world", "test", "this", "func"])
	})

	it("should accept custom separator", () => {
		const res = splitAndTrim("hello.world. now", ".")
		expect(res).toEqual(["hello", "world", "now"])
	})
})
