import { AxiosMock, axiosMock } from "@client-sdk/axios.mock"
import { testEnsureCatch } from "@client-sdk/test-utils"
import { OtpDisableDto, OtpEnableDto } from "@zmaj-js/common"
import { beforeEach, describe, expect, it } from "vitest"
import { MfaClient } from "./mfa.client"

describe("MfaClient", () => {
	let http: AxiosMock
	let client: MfaClient
	beforeEach(() => {
		http = axiosMock()
		client = new MfaClient(http)
	})

	describe("requestToEnableOtp", () => {
		beforeEach(() => {
			http.get.mockResolvedValue({ data: { jwt: true } })
		})

		it("should call api", async () => {
			const res = await client.requestToEnableOtp()
			expect(http.get).toBeCalledWith("/auth/mfa/setup-otp")
			expect(res).toEqual({ jwt: true })
		})
		it("should handle api error", () =>
			testEnsureCatch({ client: http, fn: client.requestToEnableOtp }))
	})

	describe("confirmOtp", () => {
		let data: OtpEnableDto
		beforeEach(() => {
			data = new OtpEnableDto({ code: "123456", jwt: "hello.world.test" })
			http.put.mockResolvedValue({ data: "hello" })
		})

		it("should call api", async () => {
			const res = await client.confirmOtp(data)
			expect(http.put).toBeCalledWith("/auth/mfa/enable-otp", data)
			expect(res).toEqual(undefined)
		})
		it("should handle api error", () =>
			testEnsureCatch({ client: http, fn: async () => client.confirmOtp(data) }))
	})

	describe("disableOtp", () => {
		let data: OtpDisableDto
		beforeEach(() => {
			data = new OtpDisableDto({ password: "hello_world" })
			http.put.mockResolvedValue({ data: { data: "response" } })
		})

		it("should call api", async () => {
			const res = await client.disableOtp(data)
			expect(http.put).toBeCalledWith("/auth/mfa/disable-otp", data)
			expect(res).toEqual(undefined)
		})
		it("should handle api error", () =>
			testEnsureCatch({ client: http, fn: async () => client.disableOtp(data) }))
	})

	describe("hasMfa", () => {
		beforeEach(() => {
			http.post.mockResolvedValue({ data: { enabled: true } })
		})

		it("should call api", async () => {
			const res = await client.hasMfa()
			expect(http.post).toBeCalledWith("/auth/mfa/enabled", {})
			expect(res).toEqual(true)
		})
		it("should handle api error", () =>
			testEnsureCatch({ client: http, fn: async () => client.hasMfa() }))
	})
})
