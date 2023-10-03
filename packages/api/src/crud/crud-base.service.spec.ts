import { AuthorizationService } from "@api/authorization/authorization.service"
import { throw500 } from "@api/common/throw-http"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { buildTestModule } from "@api/testing/build-test-module"
import {
	BadRequestException,
	ForbiddenException,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common"
import { AuthUser, CollectionDef, makeWritable } from "@zmaj-js/common"
import { AuthUserStub, CollectionDefStub, mockCollectionDefs } from "@zmaj-js/test-utils"
import { Mock, beforeEach, describe, expect, it, vi } from "vitest"
import { CreateBeforeEventStub } from "./__mocks__/create-event.stubs"
import {
	CrudBeforeEventStub,
	CrudFinishEventStub,
	CrudStartEventStub,
} from "./__mocks__/crud-event.mocks"
import { ReadAfterEventStub } from "./__mocks__/read-event.stubs"
import { UpdateBeforeEventStub } from "./__mocks__/update-event.stubs"
import { CrudBaseService } from "./crud-base.service"
import {
	DeleteBeforeEvent,
	ReadAfterEvent,
	ReadBeforeEvent,
	UpdateBeforeEvent,
} from "./crud-event.types"

describe("CrudBaseService", () => {
	let service: CrudBaseService<any>
	let authz: AuthorizationService
	let infraState: InfraStateService

	beforeEach(async () => {
		const module = await buildTestModule(CrudBaseService).compile()
		service = module.get(CrudBaseService)
		authz = module.get(AuthorizationService)
		infraState = module.get(InfraStateService)
	})

	describe("executeTransaction", () => {
		const throwCrudError = vi.fn()
		beforeEach(() => {
			service["throwCrudError"] = throwCrudError as any
		})
		it("should execute transaction if em provided", async () => {
			//
			await service["executeTransaction"]("existing_em" as any, async (em) => {
				expect(em).toEqual("existing_em")
			})
			expect.assertions(1)
		})

		it("should create transaction if em not provided", async () => {
			await service["executeTransaction"](undefined, async (em) => {
				expect(em).toEqual("TEST_EM")
			})
			expect.assertions(1)
		})

		it("should handle error", async () => {
			await service["executeTransaction"](undefined, async () => throw500(51233351))
			expect(throwCrudError).toBeCalledTimes(1)
			await service["executeTransaction"]("em" as any, async () => throw500(5411111))
			expect(throwCrudError).toBeCalledTimes(2)
		})
	})

	describe("omitTrx", () => {
		it("should omit trx from object", () => {
			const data = CrudFinishEventStub()
			const res = service["omitTrx"](data)
			expect(data.trx).toBeDefined()
			expect((res as Partial<typeof data>).trx).toBeUndefined()
		})
	})

	describe("throwCrudError", () => {
		it("should throw if error is http exception", () => {
			const err = new BadRequestException(4125412)
			expect(() => service["throwCrudError"](err)).toThrow(BadRequestException)
		})

		it("should throw 500 if error is not error type", () => {
			expect(() => service["throwCrudError"]("err" as any)).toThrow(
				InternalServerErrorException,
			)
		})

		/**
		 * This is for postgres
		 * Handle other db in the future
		 */
		it("should throw special error if user tried to filter/set non uuid value in uuid field", () => {
			const err = new Error("invalid input syntax for type uuid")
			expect(() => service["throwCrudError"](err)).toThrow(BadRequestException)
		})

		/**
		 * This is for postgres
		 * Handle other db in the future
		 */
		it("should throw special error if user is trying to get non existing property", () => {
			const err = new Error("Trying to query by not existing property")
			expect(() => service["throwCrudError"](err)).toThrow(BadRequestException)
		})

		it("should throw generic error if it's unknown reason", () => {
			const err = new Error("hello")
			expect(() => service["throwCrudError"](err)).toThrow(BadRequestException)
		})
	})

	describe("joinFilterAndAuthz", () => {
		let event: UpdateBeforeEvent | DeleteBeforeEvent | ReadBeforeEvent

		//
		beforeEach(() => {
			event = UpdateBeforeEventStub()
			authz.getAuthzAsOrmFilter = vi.fn(() => ({ $and: [{ name: "testing" }] }))
			authz.check = vi.fn(() => true)
			service["isFilterAllowed"] = vi.fn()
		})

		//
		it("should throw if it's called on create action", () => {
			const createEvent = CreateBeforeEventStub()
			expect(() => service["joinFilterAndAuthz"](createEvent)).toThrow()
		})
		// not allowed custom authz anymore
		// it("should get proper authz", () => {
		//   const user = AuthUserStub()
		//   event.user = user
		//   event.authz = { action: "modify", resource: "testing" }
		//   service["joinFilterAndAuthz"](event)

		//   expect(authz.getRuleConditions).toBeCalledWith({
		//     user,
		//     action: "modify",
		//     resource: "testing",
		//   })
		// })

		it("should fallback to authz from event", () => {
			const user = AuthUserStub()
			event = UpdateBeforeEventStub({
				// authz: undefined,
				user,
				collection: "test" as any,
			})
			service["joinFilterAndAuthz"](event)
			expect(authz.getAuthzAsOrmFilter).toBeCalledWith({
				user,
				action: "update",
				resource: "test",
			})
		})

		it("should join id filter from query with authz", () => {
			event.filter = {
				type: "id",
				id: 5,
			}
			event.collection = { ...event.collection, pkField: "id1" }

			const res = service["joinFilterAndAuthz"](event)
			expect(res).toEqual({ $and: [{ id1: 5 }, { name: "testing" }] })
		})

		it("should join many ids filter from query with authz", () => {
			event.filter = {
				type: "ids",
				ids: [5, 6],
			}
			event.collection = { ...event.collection, pkField: "id2" }
			// event.collection.pkField = "id2"

			const res = service["joinFilterAndAuthz"](event)
			expect(res).toEqual({ $and: [{ id2: { $in: [5, 6] } }, { name: "testing" }] })
		})

		it("should join where filter from query with authz", () => {
			service["filterToWhere"] = vi.fn().mockReturnValue({ name: { $ne: "hello" } })

			const res = service["joinFilterAndAuthz"](event)
			expect(res).toEqual({ $and: [{ name: { $ne: "hello" } }, { name: "testing" }] })
		})

		it("should filter empty and nil values", () => {
			event.filter = {
				type: "where",
				where: null as any,
			}

			vi.mocked(authz.getAuthzAsOrmFilter).mockReturnValue({ $and: [] })

			const res = service["joinFilterAndAuthz"](event)
			expect(res).toEqual({ $and: [] })
		})
	})

	describe("getCollection", () => {
		let col: CollectionDef
		beforeEach(() => {
			col = CollectionDefStub({ disabled: false })
			infraState["_collections"] = { tbl: col }
		})

		it("should throw if table is undefined", () => {
			expect(() => service["getCollection"](undefined)).toThrow(InternalServerErrorException)
		})

		it("should return collection if it's provided", () => {
			const res = service["getCollection"](col)
			expect(res).toBe(col)
		})

		it("should find collection in state if string is provided", () => {
			const res = service["getCollection"]("tbl")
			expect(res).toBe(col)
		})

		it("should throw if collection is disabled", () => {
			makeWritable(col).disabled = true
			// col.disabled = true
			expect(() => service["getCollection"]("tbl")).toThrow(NotFoundException)
		})

		it("should throw if there is no collection in state", () => {
			// asMock(infraState.findCollection).mockReturnValue(undefined)
			infraState["_collections"] = {}
			expect(() => service["getCollection"]("tbl")).toThrow(NotFoundException)
		})
	})

	describe("emit", () => {
		const emit = vi.fn().mockImplementation(async () => {})
		beforeEach(() => {
			emit.mockClear()
			service["emitter"].emitAsync = emit
			service["emitter"].hasListeners = vi.fn(() => true)
		})

		it("should emit event properly", async () => {
			const event = CrudStartEventStub({
				action: "update",
				collection: CollectionDefStub({ tableName: "super_t" }),
			})
			await service["emit"](event)
			expect(emit).toBeCalledWith("zmaj.crud.start.update.super_t", event)
		})

		it("should return finished draft", async () => {
			const event = CrudStartEventStub()
			const res = await service["emit"](event)
			expect(res).toEqual(event)
		})

		// it("should clone whole event", async () => {
		it("should shallow clone event", async () => {
			const event = CrudStartEventStub()
			const res = await service["emit"](event)
			expect(event.req).toBe(res.req)
			expect(event).not.toBe(res)
		})

		it("should not clone transaction", async () => {
			const event = CrudStartEventStub()
			const res = await service["emit"](event)
			expect(res.trx).toBeDefined()
			expect(event.trx).toBe(res.trx)
		})
	})

	describe("checkCrudPermission", () => {
		let check: Mock
		beforeEach(() => {
			check = vi.fn(() => true)
			service["authz"].check = check
		})

		// I'm not allowing custom permission to be set for crud (special key can be specified for system collections)
		// since custom permission breaks joins (what permission tobe used in join?)
		// it("should check proper permission", () => {
		//   const event = CrudBeforeEventStub({
		//     authz: { action: "hello", resource: "custom_r" },
		//     user: "user" as any,
		//   })
		//   service["checkCrudPermission"](event)
		//   expect(check).toBeCalledWith({ user: "user", resource: "custom_r", action: "hello" })
		// })

		it("should fallback to info from event if authz not provided", () => {
			const event = CrudBeforeEventStub()
			service["checkCrudPermission"](event)
			expect(check).toBeCalledWith({
				user: event.user,
				resource: event.collection,
				action: event.action,
			})
		})

		it("should throw if forbidden", () => {
			check.mockReturnValueOnce(false)
			const event = CrudBeforeEventStub()
			expect(() => service["checkCrudPermission"](event)).toThrow(ForbiddenException)
		})
	})

	describe("getAllowedData", () => {
		let event: ReadAfterEvent
		beforeEach(() => {
			event = ReadAfterEventStub({
				collection: mockCollectionDefs.comments,
				result: [
					{ body: "hello", id: 1, postId: "5" },
					{ body: "hello", id: 2, postId: "4" },
				],
			})
			authz.pickAllowedData = vi.fn().mockReturnValue({ allowed: true })
		})
		it("should get allowed data", () => {
			const res = service["getAllowedData"](event)
			expect(res).toEqual([
				{ allowed: true, id: 1 }, //
				{ allowed: true, id: 2 }, //
			])
		})

		it("should check permission properly", () => {
			service["getAllowedData"](event)
			expect(authz.pickAllowedData).nthCalledWith(1, {
				record: { body: "hello", id: 1, postId: "5" },
				user: event.user,
				resource: mockCollectionDefs.comments,
				fields: event.req.query?.["fields"],
			})
		})

		it("should throw if id is unavailable", () => {
			event.result.push({ withoutId: "hello" })
			expect(() => service["getAllowedData"](event)).toThrow(InternalServerErrorException)
		})

		it("should throw if id is invalid", () => {
			event.result.push({ id: true })
			expect(() => service["getAllowedData"](event)).toThrow(InternalServerErrorException)
		})
	})

	describe("filterToWhere", () => {
		let event: UpdateBeforeEvent | DeleteBeforeEvent | ReadBeforeEvent

		//
		beforeEach(() => {
			event = UpdateBeforeEventStub({ collection: mockCollectionDefs.posts })
		})

		it("should throw if we filter by id, but id is not present", () => {
			event.filter = {
				type: "id",
				id: undefined as any,
			}

			expect(() => service["filterToWhere"](event.filter, event.collection)).toThrow(
				BadRequestException,
			)
		})

		it("should throw if we filter by ids, but ids is not present or empty", () => {
			event.filter = {
				type: "ids",
				ids: [],
			}

			expect(() => service["filterToWhere"](event.filter, event.collection)).toThrow(
				BadRequestException,
			)
		})

		it("should convert id filter properly", () => {
			const res = service["filterToWhere"]({ type: "id", id: 5 }, event.collection)
			expect(res).toEqual({ id: 5 })
		})

		it("should convert ids filter properly", () => {
			const res = service["filterToWhere"]({ type: "ids", ids: [5, 6] }, event.collection)
			expect(res).toEqual({ id: { $in: [5, 6] } })
		})
	})

	describe("isFilterAllowed", () => {
		let user: AuthUser
		const collection = mockCollectionDefs.posts
		beforeEach(() => {
			user = AuthUserStub()

			authz.check = vi.fn((params) => {
				return false
			})
		})
		//
		it("should do nothing if all allowed", () => {
			authz.check = vi.fn(() => true)
			service["isFilterAllowed"]({
				action: "read",
				collection,
				filter: { id: "5", title: { $ne: "55" } },
				user,
			})
		})

		it("should throw if contains forbidden filter", () => {
			authz.check = vi.fn(() => false)
			expect(() =>
				service["isFilterAllowed"]({
					action: "read",
					collection,
					filter: { description: "Hello" },
					user,
				}),
			).toThrow(ForbiddenException)
		})

		it("should throw if $and contains forbidden filter", () => {
			authz.check = vi.fn(() => false)
			expect(() =>
				service["isFilterAllowed"]({
					action: "read",
					collection,
					filter: { $and: [{ description: "Hello" }] },
					user,
				}),
			).toThrow(ForbiddenException)
		})

		it("should throw if relation contains forbidden filter", () => {
			authz.check = vi.fn(() => false)
			expect(() =>
				service["isFilterAllowed"]({
					action: "read",
					collection,
					filter: { comments: { userId: 5 } },
					user,
				}),
			).toThrow(ForbiddenException)
		})
	})
})
