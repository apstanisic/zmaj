import { testEnsureCatch } from "@client-sdk/test-utils"
import { asMock, times, UrlQuery } from "@zmaj-js/common"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CrudClient } from "./crud.client"

vi.mock("axios")

describe("CrudClient", () => {
	let client: CrudClient<any, any, any>
	beforeEach(() => {
		vi.clearAllMocks()
		client = new CrudClient(axios, "test-collection")
		client["makePath"] = vi.fn().mockReturnValue("mock_path")
	})

	describe("#resourcePath", () => {
		it("should set custom path if name starts with dollar sign ($)", () => {
			const client = new CrudClient(axios, "$my-custom-path")
			expect(client["makePath"]({})).toEqual("my-custom-path")
		})

		it("should prefix with collections if it does not start with dollar", () => {
			const client = new CrudClient(axios, "non-custom-path")
			expect(client["makePath"]({})).toEqual("collections/non-custom-path")
		})
	})

	describe("makePath", () => {
		beforeEach(() => {
			// we mocked makePath, this is clean
			client = new CrudClient(axios, "test-collection")
		})

		it("should should join paths", () => {
			expect(client["makePath"]({})).toBe("collections/test-collection")
			expect(client["makePath"]({ id: 5 })).toBe("collections/test-collection/5")
			expect(client["makePath"]({ id: "test" })).toBe("collections/test-collection/test")
			expect(client["makePath"]({ query: "name=value" })).toBe(
				"collections/test-collection?name=value",
			)
			expect(client["makePath"]({ query: "name=value", id: "test" })).toBe(
				"collections/test-collection/test?name=value",
			)
		})
	})

	describe("getById", () => {
		it("should get by id", async () => {
			asMock(axios.get).mockResolvedValue({ data: { data: "test" } })
			const res = await client.getById({ id: "5555", fields: { id: true } })
			expect(res).toEqual("test")
			expect(axios.get).toBeCalledWith("mock_path")
			expect(client["makePath"]).toBeCalledWith({ id: "5555", query: "fields.id=__true" })
		})

		it("should catch error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => client.getById({ id: "test" }), //
			}))
	})

	describe("getMany", () => {
		it("should get many", async () => {
			asMock(axios.get).mockResolvedValue({ data: "result-from-api" })
			const params = {
				fields: { id: true },
				filter: { name: "hello" } as any,
				count: true,
			} as const
			const res = await client.getMany(params)
			expect(res).toEqual("result-from-api")
			expect(axios.get).toBeCalledWith("mock_path")
			expect(client["makePath"]).toBeCalledWith({
				query: "fields.id=__true&filter.name=hello&count=__true",
			})
		})

		it("should catch error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => client.getMany({}), //
			}))
	})

	describe("getAll", () => {
		beforeEach(() => {
			let i = 0
			client.getMany = vi.fn().mockImplementation(async (params: Partial<UrlQuery>) => {
				i++
				return { data: times(i === 5 ? 99 : 100, (i) => ({ id: i })) }
			})
		})

		it("should fetch until there are items", async () => {
			await client.getAll({})
			expect(client.getMany).toBeCalledTimes(5)
		})

		it("should return all data", async () => {
			const res = await client.getAll({})
			expect(res.length).toBe(499)
		})
	})

	describe("createOne", () => {
		it("should create record", async () => {
			asMock(axios.post).mockResolvedValue({ data: { data: "test" } })
			const res = await client.createOne({ data: { hello: "world" } })
			expect(res).toEqual("test")
			expect(axios.post).toBeCalledWith("mock_path", { hello: "world" })
			expect(client["makePath"]).toBeCalledWith({})
		})

		it("should handle error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => client.createOne({ data: {} }),
			}))
	})

	describe("updateById", () => {
		it("should update record", async () => {
			asMock(axios.put).mockResolvedValue({ data: { data: "test" } })
			const res = await client.updateById({ id: "5555", data: { hello: "world" } })
			expect(res).toEqual("test")
			expect(axios.put).toBeCalledWith("mock_path", { hello: "world" })
			expect(client["makePath"]).toBeCalledWith({ id: "5555" })
		})

		it("should handle error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => client.updateById({ id: 55, data: {} }),
			}))
	})

	describe("updateByIds", () => {
		it("should update records", async () => {
			client.updateById = vi.fn().mockResolvedValue({ id: 1 })
			const res = await client.updateByIds({ ids: [1, 2, 3], data: { hello: "world" } })
			for (const i of [1, 2, 3]) {
				expect(res[i - 1]).toEqual({ id: 1 })
				expect(client.updateById).nthCalledWith(i, { data: { hello: "world" }, id: i })
			}
		})

		it("should handle error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => client.updateByIds({ ids: [1, 2], data: {} }),
			}))
	})

	describe("deleteById", () => {
		it("should delete record", async () => {
			asMock(axios.delete).mockResolvedValue({ data: { data: "test" } })
			const res = await client.deleteById({ id: "5555" })
			expect(res).toEqual("test")
			expect(axios.delete).toBeCalledWith("mock_path")
			expect(client["makePath"]).toBeCalledWith({ id: "5555" })
		})

		it("should handle error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => client.deleteById({ id: 55 }),
			}))
	})
})
