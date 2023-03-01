import { beforeEach, describe, expect, it } from "vitest"
import { CrudClient } from "./clients/crud.client"
import { ZmajSdk } from "./sdk"

describe("ZmajSdk", () => {
	let sdk: ZmajSdk
	beforeEach(() => {
		sdk = new ZmajSdk({ url: "http://localhost:5000" })
	})
	describe("collection", () => {
		it("should create new client for provided collection", () => {
			const col1 = sdk.collection("test")
			expect(col1).toBeInstanceOf(CrudClient)
		})
	})

	describe("constructor", () => {
		it("Should use provided url", () => {
			const sdk = new ZmajSdk({ url: "http://example.com" })
			expect(sdk.apiUrl).toEqual("http://example.com")
		})

		// it("Should use /api endpoint if only base url is provided", () => {
		// 	const sdk = new ZmajSdk({ url: "http://example.com" })
		// 	expect(sdk.apiUrl).toEqual("http://example.com/api")
		// })

		// it("Should use provided url if pathname is provided", () => {
		// 	const sdk = new ZmajSdk({ url: "http://example.com/test/url" })
		// 	expect(sdk.apiUrl).toEqual("http://example.com/test/url")
		// })

		// it("Should ignore query string", () => {
		// 	const sdk = new ZmajSdk({ url: "http://example.com?hello=world" })
		// 	expect(sdk.apiUrl).toEqual("http://example.com/api")
		// })
	})
})
