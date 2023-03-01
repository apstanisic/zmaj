import { AuthorizationService } from "@api/authorization/authorization.service"
import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { throw403 } from "@api/common/throw-http"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common"
import { asMock, makeWritable, uuidRegex } from "@zmaj-js/common"
import { mockCollectionDefs, ReadUrlQueryStub } from "@zmaj-js/test-utils"
import { omit } from "radash"
import { beforeEach, describe, expect, it, Mock, Mocked, vi } from "vitest"
import { CrudReadParams, ReadBeforeEvent } from "./crud-event.types"
import { CrudReadService } from "./crud-read.service"
import { ReadBeforeEventStub } from "./__mocks__/read-event.stubs"

describe("CrudReadService", () => {
	let service: CrudReadService
	let infraState: InfraStateService
	let authz: Mocked<AuthorizationService>

	beforeEach(async () => {
		const module = await buildTestModule(CrudReadService).compile()
		service = module.get(CrudReadService)
		authz = module.get(AuthorizationService)
		infraState = module.get(InfraStateService)
	})

	describe("findById", () => {
		let params: Omit<CrudReadParams, "filter">

		beforeEach(() => {
			service.findWhere = vi.fn().mockResolvedValue({ data: [{ id: 1 }] })
			params = {
				options: ReadUrlQueryStub(),
				collection: "test",
				req: CrudRequestStub(),
			}
		})

		it("should find record by id using findWhere method", async () => {
			await service.findById(5, params)
			expect(service.findWhere).toBeCalledWith({
				...params,
				options: expect.anything(),
				filter: { type: "id", id: 5 },
			})
		})

		it("should limit to result to one record", async () => {
			await service.findById(5, params)
			expect(service.findWhere).toBeCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({ limit: 1 }),
				}),
			)
		})

		it("should return found item", async () => {
			const res = await service.findById(5, params)
			expect(res).toEqual({ id: 1 })
		})

		it("should throw if no item is found", async () => {
			asMock(service.findWhere).mockResolvedValue({ data: [] })
			await expect(service.findById(5, params)).rejects.toThrow(NotFoundException)
		})
	})

	describe("findWhere", () => {
		let emit: Mock
		let findWhere: Mock
		let findAndCount: Mock
		let params: CrudReadParams
		beforeEach(() => {
			emit = vi.fn(async (v) => v)
			findWhere = vi.fn().mockResolvedValue([{ id: 1 }])
			findAndCount = vi.fn().mockResolvedValue([[{ id: 1 }], 1])

			service["emit"] = emit
			service["checkCrudPermission"] = vi.fn()
			service["checkIfJoinsAllowed"] = vi.fn()
			service["parseFilter"] = vi.fn().mockResolvedValue({ id: 5 })
			service["getAllowedData"] = vi.fn((v) => v.result as any[])
			service["repoManager"].getRepo = vi
				.fn()
				.mockImplementation(() => ({ findWhere, findAndCount }))
			authz.getRuleFields = vi.fn((..._p) => null)

			params = {
				collection: mockCollectionDefs.posts,
				filter: { type: "where", where: { name: "test" } },
				options: ReadUrlQueryStub(),
				req: CrudRequestStub(),
			}
		})

		it("should mock", async () => {
			await service.findWhere(params)
			expect(1).toBe(1)
		})

		it("should throw if user does not have required permission", async () => {
			asMock(service["checkCrudPermission"]).mockImplementation(() => throw403())
			await expect(service.findWhere(params)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if user requested forbidden join", async () => {
			asMock(service["checkIfJoinsAllowed"]).mockImplementation(() => throw403())
			await expect(service.findWhere(params)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if user requested forbidden sort", async () => {
			params.options!.sort = { body: "DESC" }
			authz.getRuleFields.mockImplementation(() => null)
			await expect(service.findWhere(params)).resolves.not.toThrow()

			vi.mocked(authz.getRuleFields).mockImplementation(() => ["id", "title"])
			await expect(service.findWhere(params)).rejects.toThrow(ForbiddenException)

			authz.getRuleFields.mockImplementation(() => undefined)
			await expect(service.findWhere(params)).rejects.toThrow(ForbiddenException)
		})

		it("should count if requested", async () => {
			params.options!.count = true
			await service.findWhere(params)
			expect(findAndCount).toBeCalled()
			expect(findWhere).not.toBeCalled()
		})

		it("should not count if set to false", async () => {
			params.options!.count = false
			await service.findWhere(params)
			expect(findAndCount).not.toBeCalled()
			expect(findWhere).toBeCalled()
		})

		it("should limit and sort properly", async () => {
			params.options!.limit = 5
			params.options!.page = 3
			params.options!.sort = { id: "ASC" }
			params.options!.fields = { id: true }
			params.options!.count = false
			await service.findWhere(params)
			expect(findWhere).toBeCalledWith(
				expect.objectContaining({
					offset: 10,
					limit: 5,
					orderBy: { id: "ASC" },
					fields: { id: true },
				}),
			)
		})

		it("should use filter properly", async () => {
			params.options!.count = false
			asMock(service["parseFilter"]).mockReturnValue({ name: "test1" })
			await service.findWhere(params)
			expect(findWhere).toBeCalledWith(
				expect.objectContaining({
					where: { name: "test1" },
				}),
			)
		})

		it("should handle id filter if user modifies emit", async () => {
			params.options!.count = false
			asMock(emit)
				.mockImplementationOnce((v) => v)
				.mockImplementationOnce((v) => ({ ...v, filter: { type: "id", id: 5 } }))
			await service.findWhere(params)
			expect(findWhere).toBeCalledWith(expect.objectContaining({ where: [5] }))
		})

		it("should handle ids filter if user modifies emit", async () => {
			params.options!.count = false
			asMock(emit)
				.mockImplementationOnce((v) => v)
				.mockImplementationOnce((v) => ({ ...v, filter: { type: "ids", ids: [5, 6] } }))
			await service.findWhere(params)
			expect(findWhere).toBeCalledWith(expect.objectContaining({ where: [5, 6] }))
		})

		it("should use trx for finding records", async () => {
			params.options!.count = false
			await service.findWhere(params)
			expect(findWhere).toBeCalledWith(expect.objectContaining({ trx: "TEST_TRX" }))

			params.options!.count = true
			await service.findWhere(params)
			expect(findAndCount).toBeCalledWith(expect.objectContaining({ trx: "TEST_TRX" }))
		})

		it("should return data and count", async () => {
			params.options!.count = true
			const res = await service.findWhere(params)
			expect(res).toEqual({ count: 1, data: [{ id: 1 }] })
		})

		it("should return only data if no count requested", async () => {
			params.options!.count = false
			const res = await service.findWhere(params)
			expect(res).toEqual({ count: undefined, data: [{ id: 1 }] })
		})

		describe("emit", () => {
			beforeEach(() => {
				service["getCollection"] = vi.fn().mockReturnValue(mockCollectionDefs.posts)
			})

			it("should emit 4 times", async () => {
				await service.findWhere(params)
				expect(emit).toBeCalledTimes(4)
			})

			it("should have trx if not provided only in 2nd and 3rd emit", async () => {
				await service.findWhere(params)
				expect(emit).nthCalledWith(1, expect.not.objectContaining({ trx: expect.anything() }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ trx: "TEST_TRX" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ trx: "TEST_TRX" }))
				expect(emit).nthCalledWith(4, expect.not.objectContaining({ trx: expect.anything() }))
			})

			it("should use provided trx", async () => {
				params.trx = "my_trx" as any
				await service.findWhere(params)
				expect(emit).nthCalledWith(1, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ trx: "my_trx" }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ trx: "my_trx" }))
			})

			it("should have proper type", async () => {
				await service.findWhere(params)

				expect(emit).nthCalledWith(1, expect.objectContaining({ type: "before" }))
				expect(emit).nthCalledWith(2, expect.objectContaining({ type: "start" }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ type: "finish" }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ type: "after" }))
			})

			it("should have proper shared params", async () => {
				await service.findWhere(params)

				const toBeCalledWith = {
					// we are replacing filter, so we omit it here
					...omit(params, ["filter"]),
					action: "read",
					collection: mockCollectionDefs.posts,
				}

				expect(emit).nthCalledWith(1, expect.objectContaining(toBeCalledWith))
				expect(emit).nthCalledWith(2, expect.objectContaining(toBeCalledWith))
				expect(emit).nthCalledWith(3, expect.objectContaining(toBeCalledWith))
				expect(emit).nthCalledWith(4, expect.objectContaining(toBeCalledWith))
			})

			it("should keep changes in emitter", async () => {
				emit.mockImplementation(async (v: { type: string }) => ({ ...v, ["$" + v.type]: true }))

				await service.findWhere(params)

				expect(emit).nthCalledWith(2, expect.objectContaining({ $before: true }))
				expect(emit).nthCalledWith(3, expect.objectContaining({ $before: true }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ $before: true }))

				expect(emit).nthCalledWith(3, expect.objectContaining({ $start: true }))
				expect(emit).nthCalledWith(4, expect.objectContaining({ $start: true }))

				expect(emit).nthCalledWith(4, expect.objectContaining({ $finish: true }))
			})

			describe("emit1", () => {
				it("should emit on start of the method", async () => {
					await service.findWhere(params)
					expect(emit).nthCalledWith(1, expect.objectContaining({ type: "before" }))
				})
			})

			describe("emit2", () => {
				it("should set filter joined with authz", async () => {
					service["parseFilter"] = vi.fn().mockReturnValue({ id: 76 })

					await service.findWhere(params)
					expect(emit).nthCalledWith(
						2,
						expect.objectContaining({
							filter: { type: "where", where: { id: 76 } },
						}),
					)
				})
			})

			describe("emit3", () => {
				it("should pass array of found records in 3rd emit", async () => {
					params.options!.count = false
					await service.findWhere(params)
					expect(emit).nthCalledWith(
						3,
						expect.objectContaining({ result: [{ id: 1 }], count: undefined }),
					)
				})

				it("should pass count if requested", async () => {
					params.options!.count = true
					await service.findWhere(params)
					expect(emit).nthCalledWith(3, expect.objectContaining({ result: [{ id: 1 }], count: 1 }))
				})
			})

			describe("emit4", () => {
				it("should emit 4th time", async () => {
					await service.findWhere(params)
					expect(emit).nthCalledWith(
						4,
						expect.objectContaining({ type: "after", result: [{ id: 1 }] }),
					)
				})
			})
		})
	})

	describe("getQuickFilterFields", () => {
		it("should get all field that can be used for quick filter", () => {
			// mock infra is const value
			const fields = service["getQuickFilterFields"](mockCollectionDefs.posts)
			expect(fields.map((f) => f.fieldName)).toEqual(["body", "title"])
		})
	})

	describe("parseFilter", () => {
		let event: ReadBeforeEvent
		beforeEach(() => {
			service["joinFilterAndAuthz"] = vi.fn().mockReturnValue("classic-filter")

			event = ReadBeforeEventStub({ collection: mockCollectionDefs.posts })
			event.options.filter = {}
			authz.check = vi.fn((_: any) => true)
		})

		it("should use normal filter if $q is not provided", () => {
			event.options.filter = {}
			const filter = service["parseFilter"](event)
			expect(filter).toEqual("classic-filter")
		})

		it("should use normal filter if $q is empty string", () => {
			event.options.filter = { $q: "" }
			const filter = service["parseFilter"](event)
			expect(filter).toEqual("classic-filter")
		})

		it("should return filter that always returns false, if there is no eligible fields", () => {
			service["getQuickFilterFields"] = vi.fn().mockReturnValue([])
			event.options.filter = { $q: "test" }
			const uuidFilter = service["parseFilter"](event)
			expect(uuidFilter).toEqual({ id: expect.stringMatching(uuidRegex) })

			makeWritable(event.collection).pkType = "auto-increment"
			// event.collection.pkType = "auto-increment"
			const autoIncrementFilter = service["parseFilter"](event)
			expect(autoIncrementFilter).toEqual({ id: -1 })
		})

		it("should super filter only fields user can access", () => {
			authz.check.mockImplementation((p) => p.field === "title")
			// asMock(service['authz'])
			// service['authz'].check =
			service["getQuickFilterFields"] = vi
				.fn()
				.mockReturnValue([{ fieldName: "title" }, { fieldName: "body" }])
			event.options.filter = { $q: "test" }
			const filter = service["parseFilter"](event)
			expect(filter).toEqual({
				$or: [{ title: { $like: "%test%" } }],
			})
		})

		it("should return valid comparison", () => {
			service["getQuickFilterFields"] = vi
				.fn()
				.mockReturnValue([{ fieldName: "title" }, { fieldName: "body" }])
			event.options.filter = { $q: "test" }
			const filter = service["parseFilter"](event)
			expect(filter).toEqual({
				$or: [{ title: { $like: "%test%" } }, { body: { $like: "%test%" } }],
			})
		})
	})

	describe("checkIfJoinsAllowed", () => {
		const posts = mockCollectionDefs.posts
		beforeEach(() => {
			service["crudConfig"].allowedJoin = "toOne"
		})

		it("should do nothing if every join is allowed", () => {
			service["crudConfig"].allowedJoin = "all"
			expect(() =>
				service["checkIfJoinsAllowed"]({ id: true, comments: true, postInfo: true }, posts),
			).not.toThrow()
		})

		it("should throw if user requested non existing field", () => {
			expect(() => service["checkIfJoinsAllowed"]({ nonPossible: true }, posts)).toThrow(
				BadRequestException,
			)
		})

		it("should throw if no join allowed, and join field requested", () => {
			service["crudConfig"].allowedJoin = "none"
			expect(() => service["checkIfJoinsAllowed"]({ postInfo: true }, posts)).toThrow(
				ForbiddenException,
			)
		})

		it("should throw if no join allowed, and join field requested", () => {
			service["crudConfig"].allowedJoin = "toOne"
			expect(() => service["checkIfJoinsAllowed"]({ comments: true }, posts)).toThrow(
				ForbiddenException,
			)
		})

		it("should check recursively for nested relation", () => {
			const spy = vi.spyOn(service, "checkIfJoinsAllowed" as never)
			// infraState.findCollection = vi.fn().mockReturnValue(mockCollectionDefs.posts_tags)

			const col = makeWritable(structuredClone(posts))
			if (!col.relations["tags"]) throw new Error()
			col.relations["tags"].otherSide.collectionName = "postsTags"
			col.relations["tags"].type = "many-to-one"

			service["checkIfJoinsAllowed"]({ tags: { id: true } }, col as any)
			// expect(infraState.findCollection).toBeCalledWith("posts_tags")
			expect(spy).nthCalledWith(2, { id: true }, mockCollectionDefs.posts_tags)
			// expect(spy).nthCalledWith(2, { id: true }, )
		})
	})
})
