import { SdkStateStub } from "@client-sdk/sdk-state.stub"
import { testEnsureCatch } from "@client-sdk/test-utils"
import { asMock } from "@zmaj-js/common"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthzClient } from "./authz.client"

vi.mock("axios")

describe("AuthzClient", () => {
	let client: AuthzClient

	beforeEach(() => {
		client = new AuthzClient({ http: axios, state: SdkStateStub() })
	})

	describe("allowedActions", () => {
		beforeEach(() => {
			asMock(axios.get).mockResolvedValue({ data: { data: "response" } })
		})

		it("should call api", async () => {
			const res = await client.allowedActions()
			expect(axios.get).toBeCalledWith("admin-panel-wip/auth/allowed-actions")
			expect(res).toEqual("response")
			//
		})

		it("should handle error", () => {
			return testEnsureCatch({ client: axios, fn: client.allowedActions })
		})
	})
})
