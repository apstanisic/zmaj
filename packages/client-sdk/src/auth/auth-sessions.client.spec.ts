import { testEnsureCatch } from "@client-sdk/test-utils"
import { asMock } from "@zmaj-js/common"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthSessionsClient } from "./auth-sessions.client"

vi.mock("axios")

describe("AuthSessionsClient", () => {
	let client: AuthSessionsClient
	beforeEach(() => {
		client = new AuthSessionsClient(axios)
	})

	describe("getActive", () => {
		beforeEach(() => {
			asMock(axios.get).mockResolvedValue({ data: { data: "sessions_list" } })
		})
		it("should get sessions", async () => {
			const res = await client.getActive()
			expect(axios.get).toBeCalledWith("/auth/sessions")
			expect(res).toEqual("sessions_list")
		})

		it("should handle api error", () =>
			testEnsureCatch({
				client: axios,
				fn: client.getActive,
			}))
	})

	describe("deleteById", () => {
		beforeEach(() => {
			asMock(axios.delete).mockResolvedValue({ data: { data: "deleted" } })
		})

		it("should delete by id", async () => {
			const res = await client.deleteById({ id: "123" })
			expect(axios.delete).toBeCalledWith("/auth/sessions/123")
			expect(res).toEqual("deleted")
		})

		it("should handle api error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => client.deleteById({ id: "hello" }),
			}))
	})
})
