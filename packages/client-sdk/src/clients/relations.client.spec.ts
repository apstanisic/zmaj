import { testEnsureCatch } from "@client-sdk/test-utils"
import { asMock } from "@zmaj-js/common"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CrudClient } from "./crud.client"
import { RelationsClient } from "./relations.client"

vi.mock("axios")

describe("RelationsClient", () => {
	let client: RelationsClient
	beforeEach(() => {
		client = new RelationsClient(axios)
		asMock(axios.put).mockResolvedValue({ data: { data: "api-response" } })
		vi.clearAllMocks()
	})

	it("should extends CrudClient", () => {
		expect(client).toBeInstanceOf(CrudClient)
	})

	describe("splitManyToMany", () => {
		it("should call api", async () => {
			await client.splitManyToMany("some-junction")
			expect(axios.put).toBeCalledWith("/system/infra/relations/split-mtm/some-junction")
		})

		it("should return value from api", async () => {
			const res = await client.splitManyToMany("some-junction")
			expect(res).toBe("api-response")
		})

		it("should handle error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => client.splitManyToMany("some-junction"),
			}))
	})

	describe("joinManyToMany", () => {
		it("should call api", async () => {
			await client.joinManyToMany("someJunction")
			expect(axios.put).toBeCalledWith("/system/infra/relations/join-mtm/someJunction")
		})

		it("should return value from api", async () => {
			const res = await client.joinManyToMany("someJunction")
			expect(res).toBe("api-response")
		})

		it("should handle error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => client.joinManyToMany("junction"),
			}))

		//
	})
})
