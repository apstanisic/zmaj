import { axiosMock } from "@client-sdk/axios.mock"
import { testEnsureCatch } from "@client-sdk/test-utils"
import { asMock } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { InfraClient } from "./infra.client"

describe("SystemService", () => {
	let service: InfraClient
	let client: AxiosInstance

	beforeEach(() => {
		client = axiosMock()

		service = new InfraClient(client)
	})

	afterEach(() => {
		vi.clearAllMocks()
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

	describe("getAdminPanelInfra", () => {
		it("should call api to get oidc collections", async () => {
			asMock(client.get).mockResolvedValue({ data: { data: "infra-collections" } })
			const res = await service.getAdminPanelInfra()
			expect(client.get).toBeCalledWith("admin-panel-wip/infra")
			expect(res).toEqual("infra-collections")
		})

		it("should throw http error", async () =>
			testEnsureCatch({ fn: async () => service.getAdminPanelInfra(), client }))
	})
})
