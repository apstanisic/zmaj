import { describe, expect, expectTypeOf, it, vi } from "vitest"
import { castArray, clamp, isNil, snakeCase, times, trimEnd, trimStart } from "./lodash"

describe("times", () => {
	it("should create loop x times with callback", () => {
		const mock = vi.fn()
		times(3, (i) => mock(i))
		expect(mock).toBeCalledTimes(3)
		expect(mock).nthCalledWith(1, 0)
		expect(mock).nthCalledWith(2, 1)
		expect(mock).nthCalledWith(3, 2)
	})
})

describe("snakeCase", () => {
	it("should work", () => {
		expect(snakeCase("helloWorld23Test")).toEqual("hello_world_23_test")
	})
})

describe("trimStart", () => {
	it("should trim start", () => {
		expect(trimStart("   hello")).toEqual("hello")
		expect(trimStart("__hello", "_")).toEqual("hello")
		expect(trimStart(" __-_ hello", "_- ")).toEqual("hello")
		expect(trimStart("\\hello", "\\")).toEqual("hello")
	})

	it("should not trim end", () => {
		expect(trimStart(" hello ")).toEqual("hello ")
		expect(trimStart("_-hello-_", "-_")).toEqual("hello-_")
	})
})

describe("trimEnd", () => {
	it("should trim end", () => {
		expect(trimEnd("hello   ")).toEqual("hello")
		expect(trimEnd("hello__", "_")).toEqual("hello")
		expect(trimEnd("hello __-_ ", "_- ")).toEqual("hello")
	})

	it("should not trim start", () => {
		expect(trimEnd(" hello ")).toEqual(" hello")
		expect(trimEnd("_-hello-_", "-_")).toEqual("_-hello")
	})
})

describe("isNil", () => {
	it("isNil", () => {
		expect(isNil(null)).toEqual(true)
		expect(isNil(undefined)).toEqual(true)
		expect(isNil("")).toEqual(false)
	})
})

describe("castArray", () => {
	it("castArray", () => {
		expect(castArray([1, 2, 3])).toEqual([1, 2, 3])
		expect(castArray([1])).toEqual([1])
		expect(castArray(1)).toEqual([1])
		expect(castArray({ test: "me" })).toEqual([{ test: "me" }])
	})

	it("casts properly", () => {
		expectTypeOf(castArray(5)).toEqualTypeOf<number[]>()
		expectTypeOf(castArray([5])).toEqualTypeOf<number[]>()
		expectTypeOf(castArray([5, "val"])).toEqualTypeOf<(number | string)[]>()
	})
})

describe("clamp", () => {
	it("clamp", () => {
		expect(clamp(5, 1, 10)).toEqual(5)
		expect(clamp(0, 1, 10)).toEqual(1)
		expect(clamp(12, 1, 10)).toEqual(10)
		expect(clamp(NaN, 1, 10)).toEqual(1)
		expect(clamp("Hello" as any, 1, 10)).toEqual(1)
	})
})
