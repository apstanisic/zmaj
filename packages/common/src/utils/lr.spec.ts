import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { lr } from "./lr"

describe("lr", () => {
	let ogLog = console.log
	let log: Mock
	beforeEach(() => {
		log = vi.fn()
		ogLog = console.log
		console.log = log
	})
	afterEach(() => {
		console.log = ogLog
	})
	it("should log and return value", () => {
		const res = lr("hello world")
		expect(res).toEqual("hello world")
		expect(log).toBeCalledWith("hello world")
	})
})
