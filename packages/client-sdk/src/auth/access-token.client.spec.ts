import { axiosMock } from "@client-sdk/axios.mock"
import { SdkState } from "@client-sdk/sdk-state"
import { SdkStateStub } from "@client-sdk/sdk-state.stub"
import { stubAccessToken, testEnsureCatch } from "@client-sdk/test-utils"
import { asMock } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { AxiosInstance, AxiosRequestConfig } from "axios"
import { addSeconds, getUnixTime } from "date-fns"
import { EventEmitter } from "eventemitter3"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AccessTokenClient } from "./access-token.client"

describe("AccessTokenClient", () => {
	let client: AccessTokenClient
	let state: SdkState
	let http: AxiosInstance
	let rtHttp: AxiosInstance
	let emitter: EventEmitter<any>

	beforeEach(() => {
		http = axiosMock()
		rtHttp = axiosMock()
		emitter = new EventEmitter()

		state = SdkStateStub()
		client = new AccessTokenClient({ emitter, http, state, rtHttp })
	})

	describe("setAccessToken", () => {
		it("should set access token", () => {
			const at = stubAccessToken()
			client.setAccessToken(at)
			expect(state.getAccessToken()).toEqual(at)
		})
	})

	describe("fetchNewAccessToken", () => {
		beforeEach(() => {
			http.defaults = {
				baseURL: "http://example.com",
				headers: undefined as any,
			}
			client.setAccessToken = vi.fn()

			asMock(rtHttp.request).mockResolvedValue({ data: { accessToken: "hello" } })
		})

		it("should fetch new access token with second axios instance", async () => {
			await client.fetchNewAccessToken()
			expect(rtHttp.request).toBeCalledWith({
				method: "POST",
				url: "auth/access-token",
				baseURL: "http://example.com",
				withCredentials: true,
			})
		})

		it("should store access token ", async () => {
			await client.fetchNewAccessToken()
			expect(client.setAccessToken).toBeCalledWith("hello")
		})

		it("should should throw if access token is not returned", async () => {
			asMock(rtHttp.request).mockResolvedValue({ data: { accessToken: undefined } })
			await expect(client.fetchNewAccessToken()).rejects.toThrow()
		})

		it("should handle api error", async () => {
			await testEnsureCatch({ client: rtHttp, fn: client.fetchNewAccessToken })
		})

		// // This logs user out, if there is server error, we do not want that currently
		// it("should should remove current access token on error", async () => {
		//   asMock(rtHttp.request).mockRejectedValue({})
		//   const setAccessToken = jest
		//     .spyOn(state, "accessToken", "set")
		//     .mockImplementation(() => undefined)
		//   await expect(client.fetchNewAccessToken()).rejects.toThrow()
		//   expect(setAccessToken).toBeCalledWith(null)
		// })
	})

	describe("injectAccessToken", () => {
		it("should create interceptor", () => {
			const calledTimes = asMock(http.interceptors.request.use).mock.calls.length
			client["injectAccessToken"]()
			expect(http.interceptors.request.use).toBeCalledTimes(calledTimes + 1)
		})

		describe("interceptor function", () => {
			let fn: (config: AxiosRequestConfig) => Promise<AxiosRequestConfig>

			beforeEach(() => {
				asMock(http.interceptors.request.use).mockImplementation((injectAtFunction) => {
					fn = injectAtFunction
				})
			})

			it("should inject access token from state", async () => {
				client["injectAccessToken"]()
				const at = stubAccessToken()
				state.setAccessToken(at)
				const res = await fn({})
				expect(res).toEqual({ headers: { authorization: "Bearer " + at } })
			})

			it("should not change anything if there is no access token", async () => {
				client["injectAccessToken"]()
				state["_accessToken"] = null
				const res = await fn({})
				expect(res).toEqual({})
			})
		})
	})

	describe("accessTokenUpdater", () => {
		it("should create interceptor", () => {
			const calledTimes = asMock(http.interceptors.request.use).mock.calls.length
			client["accessTokenUpdater"]()
			expect(http.interceptors.request.use).toBeCalledTimes(calledTimes + 1)
		})

		describe("interceptor function", () => {
			let fn: (config: AxiosRequestConfig) => Promise<AxiosRequestConfig>
			const fetchNewAccessToken = vi.fn()

			beforeEach(() => {
				asMock(http.interceptors.request.use).mockImplementation((injectAtFunction) => {
					fn = injectAtFunction
				})
				client["fetchNewAccessToken"] = fetchNewAccessToken
				client["accessTokenUpdater"]()

				vi.clearAllMocks()
			})

			it("should do nothing if user is not logged in", async () => {
				state["_currentUser"] = undefined
				await fn({})
				expect(fetchNewAccessToken).not.toBeCalled()
			})

			it("should do nothing if there is more than 20 seconds left", async () => {
				const futureDate = addSeconds(new Date(), 25)
				const at = stubAccessToken(AuthUserStub({ exp: getUnixTime(futureDate) }))
				state.setAccessToken(at)
				await fn({})
				expect(fetchNewAccessToken).not.toBeCalled()
			})

			it("should refresh access token if expired", async () => {
				const at = stubAccessToken(AuthUserStub({ exp: getUnixTime(new Date()) }))
				state.setAccessToken(at)
				await fn({})
				expect(fetchNewAccessToken).toBeCalled()
			})

			it("should refresh access token if it will expire soon", async () => {
				const at = stubAccessToken(AuthUserStub({ exp: getUnixTime(addSeconds(new Date(), 5)) }))
				state.setAccessToken(at)
				emitter.emit = vi.fn()
				await fn({})
				expect(emitter.emit).toBeCalledWith("auth", "refresh")
			})
		})
	})
})
