import { AuthorizationService } from "@api/authorization/authorization.service"
import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { buildTestModule } from "@api/testing/build-test-module"
import {
	BadRequestException,
	ForbiddenException,
	InternalServerErrorException,
} from "@nestjs/common"
import { asMock, Struct, uuidRegex } from "@zmaj-js/common"
import { mockCollectionDefs } from "@zmaj-js/test-utils"
import { omit } from "radash"
import { beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { z } from "zod"
import { CrudCreateService } from "./crud-create.service"
import { CrudCreateParams } from "./crud-event.types"

describe("CrudCreateService", () => {
	let service: CrudCreateService
	let infraState: InfraStateService
	let authz: AuthorizationService

	beforeEach(async () => {
		const module = await buildTestModule(CrudCreateService).compile()
		service = module.get(CrudCreateService)
		infraState = module.get(InfraStateService)
		authz = module.get(AuthorizationService)

		// infraState.collections = camelCaseKeys(mockCollectionDefs)
	})

	describe("createOne", () => {
		let params: Omit<CrudCreateParams<any>, "dto">
		let dto: Struct = { hello: "world" }
		beforeEach(() => {
			service.createMany = vi.fn().mockResolvedValue([1])
			dto = { hello: "world" }
			params = {
				req: CrudRequestStub(),
				collection: "test",
			}
		})
		it("should create single record", async () => {
			await service.createOne(dto, params)
			expect(service.createMany).toBeCalledWith({
				...params,
				dto: [{ hello: "world" }],
			})
		})
		it("should return created item", async () => {
			const res = await service.createOne(dto, params)
			expect(res).toEqual(1)
		})

		it("should throw if no item is created", async () => {
			asMock(service.createMany).mockResolvedValue([])
			await expect(service.createOne(dto, params)).rejects.toThrow(InternalServerErrorException)
		})
	})

	describe("createMany", () => {
		let emit: Mock
		let findWhere: Mock
		let createMany: Mock

		let params: CrudCreateParams

		beforeEach(() => {
			// this is because we want to check with what data was it called
			emit = vi.fn(async (v) => ({ ...v }))
			findWhere = vi.fn().mockResolvedValue([1, 2])
			createMany = vi.fn().mockResolvedValue([1, 2])

			params = {
				collection: "posts",
				req: CrudRequestStub(),
				dto: [{ hello: "world" }],
			}
			authz.canModifyResource = vi.fn().mockReturnValue(true)
			service["emit"] = emit
			service["checkCrudPermission"] = vi.fn()
			service["joinFilterAndAuthz"] = vi.fn().mockReturnValue({ id: 5 })
			service["getAllowedData"] = vi.fn((v) => v.result as any[])
			service["repoManager"].getRepo = vi.fn().mockImplementation(() => ({ findWhere, createMany }))
		})

		it("should throw if table only has pk column", async () => {
			infraState["_collections"] = {
				posts: { ...mockCollectionDefs.posts, fields: { one: {} as any } },
			}
			await expect(service.createMany(params)).rejects.toThrow(BadRequestException)
		})

		it("should throw if no records are provided", async () => {
			params.dto = []
			await expect(service.createMany(params)).rejects.toThrow(BadRequestException)
			//
		})

		it("should throw if empty record provided", async () => {
			params.dto = [{}]
			await expect(service.createMany(params)).rejects.toThrow(BadRequestException)
			//
		})

		it("should throw if there is a record that can't be created", async () => {
			authz.canModifyResource = vi.fn().mockReturnValue(false)
			await expect(service.createMany(params)).rejects.toThrow(ForbiddenException)
			expect(authz.canModifyResource).toBeCalledWith({
				action: "create",
				changes: {
					hello: "world",
				},
				resource: mockCollectionDefs.posts,
				user: params.user,
			})
		})

		it("should delete pk if provided", async () => {
			params.dto = { id: 5, hello: "world" }
			infraState.collections["posts"] = {
				...infraState.collections["posts"]!,
				pkType: "auto-increment",
			}
			await service.createMany(params)
			expect(createMany).toBeCalledWith({ trx: "TEST_TRX", data: [{ hello: "world" }] })
		})

		// Moved this to be on the level of repository
		it.skip("should generate pk if uuid", async () => {
			params.dto = { hello: "world" }
			await service.createMany(params)
			expect(createMany).toBeCalledWith({
				trx: "TEST_TRX",
				data: [{ hello: "world", id: expect.stringMatching(uuidRegex) }],
			})
		})

		it("should use factory to construct records", async () => {
			params.dto = [{ hello: "world" }, { hello: 2 }]
			params.factory = (val) => ({ ...val, factory: true })

			await service.createMany(params)

			expect(createMany).toBeCalledWith({
				trx: "TEST_TRX",
				data: [
					{ hello: "world", factory: true }, //
					{ hello: 2, factory: true }, //
				],
			})
		})

		it("should use zod schema as factory if provided", async () => {
			params.dto = [{ hello: "world" }, { hello: 2 }]
			params.factory = z.object({ test: z.string().default("hello") })

			await service.createMany(params)

			expect(createMany).toBeCalledWith({
				trx: "TEST_TRX",
				data: [
					{ test: "hello" }, //
					{ test: "hello" }, //
				],
			})
		})

		it("should store records in db", async () => {
			await service.createMany(params)

			expect(createMany).toBeCalledWith({
				trx: "TEST_TRX",
				data: [
					{ hello: "world" }, //
				],
			})
		})

		describe("emit", () => {
			beforeEach(() => {
				service["getCollection"] = vi.fn().mockReturnValue(mockCollectionDefs.posts)
			})

			it("should emit 4 times", async () => {
				await service.createMany(params)
				expect(emit).toBeCalledTimes(4)
			})

			it("should have em if not provided only in 2nd and 3rd emit", async () => {
				await service.createMany(params)
				expect(emit).nthCalledWith(1, expect.not.objectContaining({ trx: expect.anything() }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ trx: "TEST_TRX" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ trx: "TEST_TRX" }))
				expect(emit).nthCalledWith(4, expect.not.objectContaining({ trx: expect.anything() }))
			})

			it("should use provided trx", async () => {
				params.trx = "my_trx" as any
				await service.createMany(params)
				expect(emit).nthCalledWith(1, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ trx: "my_trx" }))
			})

			it("should have proper type", async () => {
				await service.createMany(params)

				expect(emit).nthCalledWith(1, expect.objectContaining({ type: "before" }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ type: "start" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ type: "finish" }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ type: "after" }))
			})

			it("should have proper shared params", async () => {
				await service.createMany(params)

				const toBeCalledWith = {
					...params,
					action: "create",
					collection: mockCollectionDefs.posts,
				}

				// TODO TODO Why do I have to omit dto here. It's the same object!!!!!!!!!!!!!!!!!
				//
				// We are no longer deep cloning, but it's assigning id to same object we check at beginning
				// So same dto is trough whole thing, but it is mutated by assigning ID
				//

				expect(emit).nthCalledWith(1, expect.objectContaining({ ...omit(toBeCalledWith, ["dto"]) }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ ...omit(toBeCalledWith, ["dto"]) }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ ...omit(toBeCalledWith, ["dto"]) }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ ...omit(toBeCalledWith, ["dto"]) }))
			})

			it("should keep changes in emitter", async () => {
				emit.mockImplementation(async (v: { type: string }) => ({ ...v, ["$" + v.type]: true }))

				await service.createMany(params)

				expect(emit).nthCalledWith(2, expect.objectContaining({ $before: true }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ $before: true }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ $before: true }))

				expect(emit).nthCalledWith(3, expect.objectContaining({ $start: true }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ $start: true }))

				expect(emit).nthCalledWith(4, expect.objectContaining({ $finish: true }))
			})

			describe("emit1", () => {
				it("should emit on start of the method", async () => {
					await service.createMany(params)
					expect(emit).nthCalledWith(1, expect.objectContaining({ type: "before" }))
				})

				it("should always emit array of records", async () => {
					params.dto = { hello: "world" }
					await service.createMany(params)
					expect(emit).nthCalledWith(1, expect.objectContaining({ dto: [{ hello: "world" }] }))
				})
			})

			describe("emit2", () => {
				it("should emit in trx", async () => {
					await service.createMany(params)
					expect(emit).nthCalledWith(2, expect.objectContaining({ type: "start" }))
				})
			})

			describe("emit3", () => {
				it("should pass array of created records in 3rd emit", async () => {
					await service.createMany(params)
					expect(emit).nthCalledWith(3, expect.objectContaining({ result: [1, 2] }))
				})
			})

			describe("emit4", () => {
				it("should pass array of created records in 4rd emit", async () => {
					await service.createMany(params)
					expect(emit).nthCalledWith(4, expect.objectContaining({ result: [1, 2] }))
				})
			})
		})
	})
})
