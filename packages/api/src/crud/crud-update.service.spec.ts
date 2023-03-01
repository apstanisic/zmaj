import { AuthorizationService } from "@api/authorization/authorization.service"
import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { CrudRequest } from "@api/common/decorators/crud-request.type"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { buildTestModule } from "@api/testing/build-test-module"
import {
	BadRequestException,
	ForbiddenException,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common"
import { asMock, times } from "@zmaj-js/common"
import { mockCollectionDefs } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { CrudUpdateParams } from "./crud-event.types"
import { CrudUpdateService } from "./crud-update.service"

describe("CrudUpdateService", () => {
	let service: CrudUpdateService
	let infraState: InfraStateService
	let authz: AuthorizationService

	beforeEach(async () => {
		const module = await buildTestModule(CrudUpdateService).compile()
		service = module.get(CrudUpdateService)
		infraState = module.get(InfraStateService)
		authz = module.get(AuthorizationService)
	})

	describe("updateById", () => {
		let req: CrudRequest
		let params: Omit<CrudUpdateParams, "filter">
		beforeEach(() => {
			service.updateWhere = vi.fn().mockResolvedValue([1])
			req = CrudRequestStub({
				collection: "test",
				body: { hello: "world" },
				params: { id: "5" },
			})
			params = {
				changes: {
					hello: "world",
				},
				collection: "test",
				req,
			}
		})

		it("should update single record with updateWhere method", async () => {
			await service.updateById(5, params)
			expect(service.updateWhere).toBeCalledWith({
				...params,
				filter: { type: "id", id: 5 },
			})
		})

		it("should return updated item", async () => {
			const res = await service.updateById(5, params)
			expect(res).toEqual(1)
		})

		it("should throw if no item is updated", async () => {
			asMock(service.updateWhere).mockResolvedValue([])
			await expect(service.updateById(5, params)).rejects.toThrow(NotFoundException)
		})
	})

	describe("updateWhere", () => {
		let params: CrudUpdateParams
		let updateCount = 0
		let findCount = 0

		let emit: Mock
		let findWhere: Mock
		let updateById: Mock

		beforeEach(() => {
			emit = vi.fn(async (v) => v)
			findWhere = vi.fn().mockImplementation(async () => {
				return [
					{ id: findCount++, name: "og" },
					{ id: findCount, name: "og" },
				]
			})
			updateById = vi.fn().mockImplementation(async () => ({ id: updateCount++, name: "test" }))

			updateCount = 1
			findCount = 1
			params = {
				collection: "posts",
				req: CrudRequestStub(),
				changes: { hello: "world" },
				filter: { type: "where", where: { name: "TEST" } },
			}
			authz.canModifyResource = vi.fn().mockReturnValue(true)
			service["emit"] = emit
			service["joinFilterAndAuthz"] = vi.fn().mockReturnValue({ id: 5 })
			service["getAllowedData"] = vi.fn((v) => v.result as any[])
			service["repoManager"].getRepo = vi.fn().mockImplementation(() => ({ findWhere, updateById }))
		})

		it("should have proper mocks", async () => {
			const promise = service.updateWhere(params)
			await expect(promise).resolves.not.toThrow()
		})

		// I started handling empty update, since it causes problem if we only update relations
		// it("should always remove pk from changes", async () => {
		// 	params.changes = { id: 55 }
		// 	// throws because changes is empty
		// 	await expect(service.updateWhere(params)).rejects.toThrow(BadRequestException)
		// })
		// it("should throw if no change is provided", async () => {
		// 	params.changes = {}
		// 	await expect(service.updateWhere(params)).rejects.toThrow(BadRequestException)
		// })

		it("should throw if not able to change every field that he/she wants to change", async () => {
			asMock(authz.canModifyResource).mockReturnValue(false)
			await expect(service.updateWhere(params)).rejects.toThrow(ForbiddenException)
		})

		it("should update every record separately", async () => {
			await service.updateWhere(params)
			expect(updateById).nthCalledWith(
				1,
				{ changes: { hello: "world" }, trx: "TEST_TRX", id: 1 },
				//
			)
			expect(updateById).nthCalledWith(
				2, //
				{ changes: { hello: "world" }, trx: "TEST_TRX", id: 2 },
			)
			expect(updateById).toBeCalledTimes(2)
		})

		it("should throw if any update throws", async () => {
			updateById.mockRejectedValueOnce(new BadRequestException(412))
			await expect(service.updateWhere(params)).rejects.toThrow(BadRequestException)
		})

		it("should throw if row that will be updated have no id", async () => {
			findWhere.mockResolvedValueOnce([{ name: "test" }])
			await expect(service.updateWhere(params)).rejects.toThrow(InternalServerErrorException)
		})

		it("should throw if not all rows can be updated when filtering by ids", async () => {
			params.filter = { type: "ids", ids: [1, 2, 3] }
			findWhere.mockResolvedValueOnce(times(2, (i) => ({ id: i, val: 1 })))
			await expect(service.updateWhere(params)).rejects.toThrow(ForbiddenException)
		})

		describe("emit", () => {
			beforeEach(() => {
				service["getCollection"] = vi.fn().mockReturnValue(mockCollectionDefs.posts)
			})

			it("should emit 4 times", async () => {
				await service.updateWhere(params)
				expect(emit).toBeCalledTimes(4)
			})

			it("should have em if not provided only in 2nd and 3rd emit", async () => {
				await service.updateWhere(params)
				expect(emit).nthCalledWith(1, expect.not.objectContaining({ trx: expect.anything() }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ trx: "TEST_TRX" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ trx: "TEST_TRX" }))
				expect(emit).nthCalledWith(4, expect.not.objectContaining({ trx: expect.anything() }))
			})

			it("should use provided trx", async () => {
				params.trx = "my_trx" as any
				await service.updateWhere(params)
				expect(emit).nthCalledWith(1, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ trx: "my_trx" }))
			})

			it("should have proper type", async () => {
				await service.updateWhere(params)

				expect(emit).nthCalledWith(1, expect.objectContaining({ type: "before" }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ type: "start" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ type: "finish" }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ type: "after" }))
			})

			it("should have proper shared params", async () => {
				await service.updateWhere(params)

				const toBeCalledWith = {
					...params,
					action: "update",
					collection: mockCollectionDefs.posts,
				}

				expect(emit).nthCalledWith(1, expect.objectContaining(toBeCalledWith))
				expect(emit).nthCalledWith(2, expect.objectContaining(toBeCalledWith))
				expect(emit).nthCalledWith(3, expect.objectContaining(toBeCalledWith))
				expect(emit).nthCalledWith(4, expect.objectContaining(toBeCalledWith))
			})

			it("should keep changes in emitter", async () => {
				emit.mockImplementation(async (v: { type: string }) => ({ ...v, ["$" + v.type]: true }))

				await service.updateWhere(params)

				expect(emit).nthCalledWith(2, expect.objectContaining({ $before: true }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ $before: true }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ $before: true }))

				expect(emit).nthCalledWith(3, expect.objectContaining({ $start: true }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ $start: true }))

				expect(emit).nthCalledWith(4, expect.objectContaining({ $finish: true }))
			})

			describe("emit1", () => {
				it("should emit on start of the method", async () => {
					await service.updateWhere(params)
					expect(emit).nthCalledWith(1, expect.objectContaining({ type: "before" }))
				})
			})

			// TODO
			describe("emit2", () => {
				it("should emit records that will be updated", async () => {
					await service.updateWhere(params)
					expect(emit).nthCalledWith(
						2,
						expect.objectContaining({
							toUpdate: [
								{
									id: 1,
									changed: { name: "og", hello: "world" },
									original: { id: 1, name: "og" },
								},
								{
									id: 2,
									changed: { name: "og", hello: "world" },
									original: { id: 2, name: "og" },
								},

								//
							],
						}),
					)
				})
			})

			describe("emit3", () => {
				it("should pass array of updated records in 3rd emit", async () => {
					await service.updateWhere(params)
					expect(emit).nthCalledWith(
						3,
						expect.objectContaining({
							result: [
								{ id: 1, name: "test" }, //
								{ id: 2, name: "test" }, //
							],
						}),
					)
				})
			})

			describe("emit4", () => {
				it("should emit after everything", async () => {
					await service.updateWhere(params)
					expect(emit).nthCalledWith(
						4,
						expect.objectContaining({
							result: [
								{ id: 1, name: "test" }, //
								{ id: 2, name: "test" }, //
							],
						}),
					)
				})
			})
		})
	})
})
