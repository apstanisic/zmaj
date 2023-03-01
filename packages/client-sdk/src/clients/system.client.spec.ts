import { axiosMock } from "@client-sdk/axios.mock"
import { testEnsureCatch } from "@client-sdk/test-utils"
import { asMock } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SystemClient } from "./system.client"

describe("SystemService", () => {
	let service: SystemClient
	let client: AxiosInstance

	beforeEach(() => {
		client = axiosMock()

		service = new SystemClient(client)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	/**
	 *
	 */
	describe("getOidcProvider", () => {
		it("should call api to get oidc provider", async () => {
			asMock(client.get).mockResolvedValue({ data: { data: "oidc-providers" } })
			const res = await service.getOidcProviders()
			expect(client.get).toBeCalledWith("auth/oidc-providers")
			expect(res).toEqual("oidc-providers")
		})

		it("should throw http error", async () => {
			await testEnsureCatch({ fn: async () => service.getOidcProviders(), client })
		})
	})

	/**
	 *
	 */
	describe("isSignUpAllowed", () => {
		it("should check if sign up is allowed", async () => {
			asMock(client.get).mockResolvedValue({ data: { allowed: "result" } })
			const res = await service.isSignUpAllowed()
			expect(client.get).toBeCalledWith("auth/sign-up/allowed")
			expect(res).toBe("result")
		})

		it("should throw http error", async () =>
			testEnsureCatch({ fn: async () => service.isSignUpAllowed(), client }))
	})

	/**
	 *
	 */
	describe("getCollections", () => {
		it("should call api to get oidc collections", async () => {
			asMock(client.get).mockResolvedValue({ data: { data: "infra-collections" } })
			const res = await service.getCollections()
			expect(client.get).toBeCalledWith("system/infra/collections")
			expect(res).toEqual("infra-collections")
		})

		it("should throw http error", async () =>
			testEnsureCatch({ fn: async () => service.getCollections(), client }))
	})
})
