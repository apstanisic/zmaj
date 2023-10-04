import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { CrudRequest } from "@api/common/decorators/crud-request.type"
import { throw403 } from "@api/common/throw-http"
import { buildTestModule } from "@api/testing/build-test-module"
import { ForbiddenException, NotFoundException } from "@nestjs/common"
import { asMock } from "@zmaj-js/common"
import { mockCollectionDefs } from "@zmaj-js/test-utils"
import { Mock, beforeEach, describe, expect, it, vi } from "vitest"
import { CrudDeleteService } from "./crud-delete.service"
import { CrudDeleteParams } from "./crud-event.types"

describe("CrudDeleteService", () => {
	let service: CrudDeleteService

	beforeEach(async () => {
		const module = await buildTestModule(CrudDeleteService).compile()
		service = module.get(CrudDeleteService)
	})

	describe("deleteById", () => {
		let req: CrudRequest
		let params: Omit<CrudDeleteParams<any>, "filter">
		beforeEach(() => {
			service.deleteWhere = vi.fn().mockResolvedValue([1])
			req = CrudRequestStub({ params: { id: "55" }, collection: "test" })
			params = {
				collection: "posts",
				req,
			}
		})
		it("should delete record by id", async () => {
			await service.deleteById(5, params)
			expect(service.deleteWhere).toBeCalledWith({
				...params,
				filter: { type: "id", id: 5 },
			})
		})
		it("should return deleted item", async () => {
			const res = await service.deleteById(5, params)
			expect(res).toEqual(1)
		})

		it("should throw if no item is deleted", async () => {
			asMock(service.deleteWhere).mockResolvedValue([])
			await expect(service.deleteById(5, params)).rejects.toThrow(NotFoundException)
		})
	})

	describe("deleteWhere", () => {
		let emit: Mock
		let findWhere: Mock
		let deleteWhere: Mock

		let params: CrudDeleteParams<any>
		beforeEach(() => {
			emit = vi.fn(async (v) => v)
			findWhere = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
			deleteWhere = vi.fn().mockResolvedValue([1, 2])

			params = {
				collection: "posts",
				filter: { type: "id", id: "55" },
				req: CrudRequestStub(),
			}
			service["emit"] = emit
			service["checkCrudPermission"] = vi.fn()
			service["joinFilterAndAuthz"] = vi.fn().mockReturnValue({ id: 5 })
			service["getAllowedData"] = vi.fn((v) => v.result as any[])
			service["orm"].getRepo = vi.fn().mockImplementation(() => ({ findWhere, deleteWhere }))
		})

		it("should throw if permission is forbidden", async () => {
			service["checkCrudPermission"] = vi.fn().mockImplementation(() => throw403())
			await expect(service.deleteWhere(params)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if not all ids can be deleted", async () => {
			emit.mockImplementationOnce((v) => ({ ...v, filter: { type: "ids", ids: [1, 2] } }))
			findWhere.mockImplementationOnce(() => [{ id: 1 }])

			await expect(service.deleteWhere(params)).rejects.toThrow(ForbiddenException)
		})

		it("should return allowed data", async () => {
			emit.mockImplementationOnce(async (v) => v)
				.mockImplementationOnce(async (v) => v)
				.mockImplementationOnce(async (v) => v)
				.mockImplementationOnce(async (v) => ({ result: ["hello", "world"] }))

			const res = await service.deleteWhere(params)

			expect(service["getAllowedData"]).toBeCalledWith({ result: ["hello", "world"] })
			expect(res).toEqual(["hello", "world"])
		})

		describe("emit", () => {
			beforeEach(() => {
				service["getCollection"] = vi.fn().mockReturnValue(mockCollectionDefs.posts)
			})

			it("should emit 4 times", async () => {
				await service.deleteWhere(params)
				expect(emit).toBeCalledTimes(4)
			})

			it("should have em if not provided only in 2nd and 3rd emit", async () => {
				await service.deleteWhere(params)
				expect(emit).nthCalledWith(
					1,
					expect.not.objectContaining({ trx: expect.anything() }),
				)
				expect(emit).nthCalledWith(2, expect.objectContaining({ trx: "TEST_TRX" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ trx: "TEST_TRX" }))
				expect(emit).nthCalledWith(
					4,
					expect.not.objectContaining({ trx: expect.anything() }),
				)
			})

			it("should use provided trx", async () => {
				params.trx = "my_trx" as any
				await service.deleteWhere(params)
				expect(emit).nthCalledWith(1, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ trx: "my_trx" }))
			})

			it("should have proper type", async () => {
				await service.deleteWhere(params)

				expect(emit).nthCalledWith(1, expect.objectContaining({ type: "before" }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ type: "start" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ type: "finish" }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ type: "after" }))
			})

			it("should have proper shared params", async () => {
				await service.deleteWhere(params)

				const toBeCalledWith = {
					...params,
					action: "delete",
					collection: mockCollectionDefs.posts,
				}

				expect(emit).nthCalledWith(1, expect.objectContaining(toBeCalledWith))
				expect(emit).nthCalledWith(2, expect.objectContaining(toBeCalledWith))
				expect(emit).nthCalledWith(3, expect.objectContaining(toBeCalledWith))
				expect(emit).nthCalledWith(4, expect.objectContaining(toBeCalledWith))
			})

			it("should keep changes in emitter", async () => {
				emit.mockImplementation(async (v: { type: string }) => ({
					...v,
					["$" + v.type]: true,
				}))

				await service.deleteWhere(params)

				expect(emit).nthCalledWith(2, expect.objectContaining({ $before: true }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ $before: true }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ $before: true }))

				expect(emit).nthCalledWith(3, expect.objectContaining({ $start: true }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ $start: true }))

				expect(emit).nthCalledWith(4, expect.objectContaining({ $finish: true }))
			})

			describe("emit1", () => {
				it("should emit on start of the method", async () => {
					await service.deleteWhere(params)
					expect(emit).nthCalledWith(1, expect.objectContaining({ type: "before" }))
				})
			})

			describe("emit2", () => {
				it("should pass array of items to delete in 2nd emit", async () => {
					await service.deleteWhere(params)
					expect(emit).nthCalledWith(
						2,
						expect.objectContaining({
							toDelete: [
								{ id: 1, original: { id: 1 } },
								{ id: 2, original: { id: 2 } },
							],
						}),
					)
				})
			})

			describe("emit3", () => {
				it("should pass array of deleted records in 3rd emit", async () => {
					await service.deleteWhere(params)
					expect(emit).nthCalledWith(3, expect.objectContaining({ result: [1, 2] }))
				})
			})

			describe("emit4", () => {
				it("should pass array of deleted records in 4rd emit", async () => {
					await service.deleteWhere(params)
					expect(emit).nthCalledWith(4, expect.objectContaining({ result: [1, 2] }))
				})
			})
		})
	})
})
