import { throw500 } from "@api/common/throw-http"
import { AuthorizationService, InfraStateService } from "@api/index"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, ForbiddenException } from "@nestjs/common"
import { ReadUrlQueryStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ReadBeforeEvent, ReadStartEvent } from "./crud-event.types"
import { CrudReadJoinService } from "./crud-read-join.service"
import { ReadBeforeEventStub, ReadStartEventStub } from "./__mocks__/read-event.stubs"

describe("CrudReadJoinService", () => {
	let service: CrudReadJoinService
	let infraState: InfraStateService
	let authz: AuthorizationService

	beforeEach(async () => {
		const module = await buildTestModule(CrudReadJoinService).compile()
		service = module.get(CrudReadJoinService)
		service["globalConfig"].enableAdminPanelIntegration = true
		authz = module.get(AuthorizationService)
		infraState = module.get(InfraStateService)
	})

	describe("checkIfUserCanUpdateCollection", () => {
		let event: ReadBeforeEvent
		beforeEach(() => {
			event = ReadBeforeEventStub()
			event.options.otmFkField = "postId"
			authz.check = vi.fn().mockReturnValue(false)
		})

		it("should do nothing if user is not getting records for o2m dialog", () => {
			event.options.otmFkField = undefined
			const res = service.__checkIfUserCanUpdateCollection(event)
			expect(res).toBeUndefined()
		})

		it("should throw if user can't update collection", () => {
			expect(() => service.__checkIfUserCanUpdateCollection(event)).toThrow()
		})

		it("should do nothing if user can update collection", () => {
			authz.check = vi.fn().mockReturnValue(true)
			const res = service.__checkIfUserCanUpdateCollection(event)
			expect(res).toBeUndefined()
		})
	})

	describe("getOnlyEntitiesThatUserCanUpdate", () => {
		let event: ReadStartEvent
		beforeEach(() => {
			event = ReadStartEventStub()
			event.options.otmFkField = "post_id"
			event.options.otmShowForbidden = false
			event.filter = { type: "id", id: 5 }
			authz.getRuleConditions = vi.fn().mockImplementation(() => throw500(423))
		})
		//
		it("should do nothing if user is not requesting to-many dialog options", () => {
			event.options.otmFkField = undefined
			const res = service.__getOnlyEntitiesThatUserCanUpdate(event)
			expect(res).toBeUndefined()
		})

		it("should do nothing if user wants to see records that he/she can't change", () => {
			event.options.otmShowForbidden = true
			const res = service.__getOnlyEntitiesThatUserCanUpdate(event)
			expect(res).toBeUndefined()
		})

		it("should join current filter with conditions that is needed to update record", () => {
			authz.getRuleConditions = vi.fn().mockReturnValue({ name: "hello" })
			service.__getOnlyEntitiesThatUserCanUpdate(event)
			expect(event.filter).toEqual({
				type: "where",
				where: {
					$and: [
						{ id: 5 }, //
						{ name: "hello" },
					],
				},
			})
			//
		})

		it("should append condition if filter is already `$and`", () => {
			//
			authz.getRuleConditions = vi.fn().mockReturnValue({ name: "hello" })
			service["filterToWhere"] = vi.fn().mockReturnValue({ $and: [{ test: "me" }] })
			service.__getOnlyEntitiesThatUserCanUpdate(event)
			expect(event.filter).toEqual({
				type: "where",
				where: {
					$and: [
						{ test: "me" }, //
						{ name: "hello" },
					],
				},
			})
		})
	})

	describe("generateManyToManyFilter", () => {
		let event: ReadStartEvent
		// const raw = vi.fn(() => "hello")
		let literal = vi.fn(() => "hello")

		beforeEach(() => {
			event = ReadStartEventStub({
				options: ReadUrlQueryStub({
					mtmCollection: "posts",
					mtmProperty: "tags",
					mtmRecordId: 5,
				}),
				trx: {} as any,
			})
			authz.check = vi.fn().mockReturnValue(true)
			// infraState.collections = camelCaseKeys(mockCollectionDefs)
			literal = vi.fn(() => "hello")
			// @ts-ignore
			service["repoManager"] = {
				getOrm: vi.fn(() => ({ literal })),
			}
		})
		it("should do nothing if left record id not provided", async () => {
			authz.check = vi.fn().mockImplementation(() => throw500(4213))

			event.options.mtmRecordId = undefined
			await service.__generateManyToManyFilter(event)
			expect(authz.check).not.toBeCalled()
		})

		it("should do nothing if left collection not provided", async () => {
			authz.check = vi.fn().mockImplementation(() => throw500(64321543))

			event.options.mtmCollection = undefined
			await service.__generateManyToManyFilter(event)
			expect(authz.check).not.toBeCalled()
		})

		it("should do nothing if left property not provided", async () => {
			authz.check = vi.fn().mockImplementation(() => throw500(341233))

			event.options.mtmProperty = undefined
			await service.__generateManyToManyFilter(event)
			expect(authz.check).not.toBeCalled()
		})

		it("should throw if invalid collection provided", async () => {
			event.options.mtmCollection = "non_exist"
			await expect(service.__generateManyToManyFilter(event)).rejects.toThrow(BadRequestException)
		})

		// it("should throw if invalid property provided", async () => {
		//   event.query.mtmProperty = "non_exist"
		//   await expect(service.__generateManyToManyFilter(event)).rejects.toThrow(BadRequestException)
		// })

		it("should throw if invalid property provided", async () => {
			event.options.mtmProperty = "non_exist"
			await expect(service.__generateManyToManyFilter(event)).rejects.toThrow(BadRequestException)
		})

		it("should throw if action not allowed", async () => {
			authz.check = vi.fn().mockReturnValue(false)
			await expect(service.__generateManyToManyFilter(event)).rejects.toThrow(ForbiddenException)
		})

		it("should ensure that user can modify junction table", async () => {
			await service.__generateManyToManyFilter(event)
			expect(authz.check).toBeCalledWith({
				action: "modify",
				resource: "collections.postsTags",
				user: event.user,
			})
		})

		it("should have proper filter", async () => {
			service["filterToWhere"] = vi.fn().mockReturnValue({ name: "test" })
			await service.__generateManyToManyFilter(event)
			expect(event.filter).toEqual({
				type: "where",
				where: {
					$and: [
						{ name: "test" },
						{ id: { $nin: "hello" } },
						//
					],
				},
			})
		})

		it("should not nest if there is already 'and' condition", async () => {
			service["filterToWhere"] = vi.fn().mockReturnValue({ $and: [{ name: "test" }] })
			await service.__generateManyToManyFilter(event)

			expect(event.filter).toEqual({
				type: "where",
				where: {
					$and: [
						{ name: "test" },
						{ id: { $nin: "hello" } },
						//
					],
				},
			})
		})
	})
})
