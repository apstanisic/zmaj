import { beforeEach, describe, expect, it } from "vitest"
import { SdkError } from "./errors/sdk.error"
import { ZmajSingleton } from "./singleton"

describe("ZmajSingleton", () => {
	beforeEach(() => {
		ZmajSingleton.destroy()
	})

	it("should throw if forcedly constructor is called", () => {
		// @ts-expect-error Ensure that it throws error if someone ignores TS
		expect(() => new ZmajSingleton()).toThrow(SdkError)
	})

	it("should throw if user tries to access instance before init", () => {
		expect(() => ZmajSingleton.instance).toThrow(SdkError)
	})

	it("should throw if user tries to initialize twice", () => {
		expect(() => {
			ZmajSingleton.initialize({ url: "http://lh" })
			ZmajSingleton.initialize({ url: "http://lh" })
		}).toThrow(SdkError)
	})

	it("should always return same instance", () => {
		ZmajSingleton.initialize({ url: "http://lh" })
		const i1 = ZmajSingleton.instance
		const i2 = ZmajSingleton.instance
		expect(i1).toBe(i2)
	})

	describe("destroy", () => {
		it("should destroy instance", () => {
			ZmajSingleton.initialize({ url: "http://lh" })
			ZmajSingleton.destroy()
			expect(() => ZmajSingleton.instance).toThrow()
		})
	})
})
