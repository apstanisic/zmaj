import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common"
import { asMock, ToManyChange } from "@zmaj-js/common"
import { mockCollectionDefs, mockRelationDefs } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { ZodError } from "zod"
import { CrudUpdateParams } from "./crud-event.types"
import { CrudUpdateService } from "./crud-update.service"
import { CrudWithRelationsService } from "./crud-with-relations.service"
import { CrudConfig } from "./crud.config"

describe("CrudWithRelationsService", () => {
	let service: CrudWithRelationsService
	let config: CrudConfig
	let state: InfraStateService
	let updateS: CrudUpdateService

	beforeEach(async () => {
		const module = await buildTestModule(CrudWithRelationsService).compile()
		service = module.get(CrudWithRelationsService)
		config = module.get(CrudConfig)
		state = module.get(InfraStateService)
		updateS = module.get(CrudUpdateService)

		config.relationChange = "toManyFks"
		state.getCollection = vi.fn().mockReturnValue(mockCollectionDefs.posts)
	})

	it("should compile", () => {
		expect(service).toBeDefined()
	})

	describe("updateById", () => {
		let params: CrudUpdateParams
		beforeEach(() => {
			params = {
				changes: { body: "hello body" },
				collection: mockCollectionDefs.posts,
				filter: { type: "id", id: 5 },
				req: CrudRequestStub(),
			}
			service.handleToManyChange = vi.fn()
			updateS.updateById = vi.fn().mockResolvedValue({ id: 5 })
		})

		it("should throw if collection does not exist", async () => {
			asMock(state.getCollection).mockReturnValue(undefined)
			await expect(service.updateById(5, params)).rejects.toThrow(NotFoundException)
		})

		it("should throw if user tries to change relation but it's forbidden", async () => {
			config.relationChange = "none"
			params.changes["comments"] = "rel value"
			await expect(service.updateById(5, params)).rejects.toThrow(ForbiddenException)
		})

		it("should throw on non existing property", async () => {
			params.changes["nonExisting"] = "rel value"
			await expect(service.updateById(5, params)).rejects.toThrow(BadRequestException)
		})

		it("should throw if user tries to change direct relation (not yet available)", async () => {
			config.relationChange = "toManyFks"
			params.changes["postInfo"] = "rel value"
			await expect(service.updateById(5, params)).rejects.toThrow(BadRequestException)
		})

		it("should update main record", async () => {
			params.changes["comments"] = { added: [], removed: [], type: "toMany" } as ToManyChange
			await service.updateById(5, params)
			expect(updateS.updateById).toBeCalledWith(5, {
				...params,
				req: params.req,
				changes: { body: "hello body" },
				trx: "TEST_TRX",
			})
		})

		it("should update to-many relations", async () => {
			params.changes["comments"] = { added: [1, 2], removed: [4], type: "toMany" } as ToManyChange
			params.changes["tags"] = { added: [1], removed: [2], type: "toMany" } as ToManyChange
			await service.updateById(5, params)
			expect(service.handleToManyChange).nthCalledWith(1, {
				mainRecordId: 5,
				trx: "TEST_TRX",
				change: params.changes["comments"],
				relation: mockCollectionDefs.posts.relations["comments"],
				params: params,
			})

			expect(service.handleToManyChange).nthCalledWith(2, {
				mainRecordId: 5,
				trx: "TEST_TRX",
				change: params.changes["tags"],
				relation: mockCollectionDefs.posts.relations["tags"],
				params: params,
			})
		})

		it("should throw if to many changes are in bad format", async () => {
			params.changes["tags"] = { added: [1], wrongRemoved: [2], type: "to-many" }
			await expect(service.updateById(5, params)).rejects.toThrow(ZodError)
		})

		it("should return updated item", async () => {
			const res = await service.updateById(5, params)
			expect(res).toEqual({ id: 5 })
			//
		})
	})

	describe("handleToManyChange", () => {
		let updateWhere: Mock
		let createMany: Mock
		let deleteWhere: Mock
		let params: Parameters<(typeof service)["handleToManyChange"]>[0]
		beforeEach(() => {
			updateWhere = vi.fn()
			createMany = vi.fn().mockResolvedValue([{ id: 4 }, { id: 7 }])
			deleteWhere = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])

			service["update"].updateWhere = updateWhere
			service["create"].createMany = createMany
			service["del"].deleteWhere = deleteWhere

			params = {
				change: { added: [1, 2], removed: [4], type: "toMany" },
				trx: "TEST_TRX" as any,
				mainRecordId: 5,
				params: { req: "req", user: "user" } as any,
				relation: mockRelationDefs.posts.comments,
			}
		})

		it("should add records from o2m", async () => {
			//
			await service.handleToManyChange(params)
			expect(updateWhere).nthCalledWith(1, {
				changes: { postId: 5 },
				collection: "comments",
				trx: "TEST_TRX",
				filter: {
					ids: [1, 2],
					type: "ids",
				},
				req: "req",
				user: "user",
			})
		})

		it("should remove records from o2m", async () => {
			//
			await service.handleToManyChange(params)
			expect(updateWhere).nthCalledWith(2, {
				changes: { postId: null },
				collection: "comments",
				trx: "TEST_TRX",
				filter: {
					ids: [4],
					type: "ids",
				},
				req: "req",
				user: "user",
			})
		})

		it("should remove records from m2m", async () => {
			params.relation = mockRelationDefs.posts.tags
			params.change.removed = [5, 6]
			//
			await service.handleToManyChange(params)
			expect(deleteWhere).toBeCalledWith({
				collection: "postsTags",
				trx: "TEST_TRX",
				req: "req",
				user: "user",
				filter: {
					type: "where",
					where: {
						postId: 5,
						tagId: {
							$in: [5, 6],
						},
					},
				},
			})
		})
		it("should throw if user can't delete all records", async () => {
			params.relation = mockRelationDefs.posts.tags
			params.change.removed = [5, 6, 7]
			//
			await expect(service.handleToManyChange(params)).rejects.toThrow(ForbiddenException)
		})

		it("should create rows for m2m", async () => {
			params.relation = mockRelationDefs.posts.tags
			params.change.added = [3, 11]

			await service.handleToManyChange(params)
			expect(createMany).toBeCalledWith({
				//
				collection: "postsTags",
				dto: [
					{
						postId: 5,
						tagId: 3,
					},
					{
						postId: 5,
						tagId: 11,
					},
				],
				trx: "TEST_TRX",
				req: "req",
				user: "user",
			})
			//
		})
	})
})
