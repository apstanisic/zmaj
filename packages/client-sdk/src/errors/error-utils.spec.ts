import axios from "axios"
import { describe, expect, it, vi } from "vitest"
import { sdkThrow } from "./error-utils"
import { SdkHttpError } from "./sdk-http.error"
import { SdkError } from "./sdk.error"

describe("sdkThrow", () => {
	it("should throw http error if error is axios error", () => {
		axios.isAxiosError = vi.fn().mockImplementationOnce(() => true) as any
		expect(() => sdkThrow("axiosError")).toThrow(SdkHttpError)
	})

	it("should throw sdk error if error is common error", () => {
		axios.isAxiosError = vi.fn().mockImplementationOnce(() => false) as any
		expect(() => sdkThrow(new Error())).toThrow(SdkError)
		expect(() => sdkThrow(new Error())).not.toThrow(SdkHttpError)
	})

	it("should throw sdk error if not http error", () => {
		axios.isAxiosError = vi.fn().mockImplementation(() => false) as any
		expect(() => sdkThrow("sdk error")).toThrow(SdkError)
		expect(() => sdkThrow()).toThrow(SdkError)
	})
})
