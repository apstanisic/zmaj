import { CreateFinishEventStub } from "@api/crud/__mocks__/create-event.stubs"
import { CrudFinishEventStub } from "@api/crud/__mocks__/crud-event.mocks"
import { DeleteFinishEventStub } from "@api/crud/__mocks__/delete-event.stubs"
import { UpdateFinishEventStub } from "@api/crud/__mocks__/update-event.stubs"
import type { CrudFinishEvent } from "@api/crud/crud-event.types"
import { buildTestModule } from "@api/testing/build-test-module"
import { InternalServerErrorException } from "@nestjs/common"
import { ActivityLog, ADMIN_ROLE_ID, AuthUser } from "@zmaj-js/common"
import { AuthUserStub, mockCollectionDefs } from "@zmaj-js/test-utils"
import { addMinutes } from "date-fns"
import { v4 } from "uuid"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ActivityLogConfig } from "./activity-log.config"
import { ActivityLogService } from "./activity-log.service"

describe("ActivityLogService", () => {
	let service: ActivityLogService
	let event: CrudFinishEvent
	let config: ActivityLogConfig

	beforeEach(async () => {
		const module = await buildTestModule(ActivityLogService).compile()
		event = CrudFinishEventStub({ action: "update" })

		service = module.get(ActivityLogService)
		config = module.get(ActivityLogConfig)
		config.logLevel = "full"
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})

	it("should have proper repo", () => {
		expect(service.repo).toEqual({ testId: "REPO_zmaj_activity_log" })
	})

	/**
	 *
	 */
	describe("onAfter", () => {
		const createMany = vi.fn()

		beforeEach(() => {
			service.repo.createMany = createMany
		})

		it("should not create logs for read event", async () => {
			event.action = "read"
			await service.__logChanges(event)
			expect(service.repo.createMany).not.toBeCalled()
			//
		})

		it("should create logs for event", async () => {
			service["generateLogs"] = vi.fn(() => [{ id: 1 } as never])
			await service.__logChanges(event)
			expect(service["generateLogs"]).toBeCalledWith(event)
			//
		})

		it("should store logs in database", async () => {
			service["generateLogs"] = vi.fn(() => [{ id: 1 } as never])
			await service.__logChanges(event)
			expect(service.repo.createMany).toBeCalledWith({ data: [{ id: 1 }], trx: event.trx })
			//
		})
	})

	describe("generateLogs", () => {
		let event: CrudFinishEvent
		const userId = v4()
		let now: Date
		let user: AuthUser

		beforeEach(() => {
			vi.useFakeTimers()
			now = new Date()
			user = AuthUserStub({
				email: "test@example.com",
				roleId: ADMIN_ROLE_ID,
				userId,
			})
			event = CrudFinishEventStub({
				action: "create",
				collection: mockCollectionDefs.posts,
			})
			event.req.userAgent = "UA"
			event.req.ip = "10.0.0.0"
			event.user = AuthUserStub({
				email: "test@example.com",
				roleId: ADMIN_ROLE_ID,
				userId,
			})
		})

		afterEach(() => {
			vi.useRealTimers()
		})

		it("should create common log info correctly", () => {
			const commonLog: Partial<ActivityLog> = {
				ip: "10.0.0.0",
				userAgent: "UA",
				itemId: "5",
				resource: "collections.posts",
				userId,
				// createdAt: now,
				embeddedUserInfo: {
					email: "test@example.com",
					roleId: ADMIN_ROLE_ID,
					userId,
				},
			}

			// create
			const createEvent = CreateFinishEventStub({
				user,
				collection: mockCollectionDefs.posts,
				result: [{ id: 5, title: "hello" }],
			})
			createEvent.req.ip = "10.0.0.0"
			createEvent.req.userAgent = "UA"
			const createRes = service["generateLogs"](createEvent)
			expect(createRes[0]).toEqual(expect.objectContaining(commonLog))
			expect(createRes).toHaveLength(1)

			// update
			const updateEvent = UpdateFinishEventStub({
				user,
				collection: mockCollectionDefs.posts,
				result: [{ id: 5, title: "hello" }],
				toUpdate: [{ id: 5, changed: {}, original: {} }],
			})
			updateEvent.req.ip = "10.0.0.0"
			updateEvent.req.userAgent = "UA"
			const updateRes = service["generateLogs"](updateEvent)
			expect(updateRes[0]).toEqual(expect.objectContaining(commonLog))
			expect(updateRes).toHaveLength(1)

			// delete
			const deleteEvent = DeleteFinishEventStub({
				user,
				collection: mockCollectionDefs.posts,
				result: [{ id: 5, title: "hello" }],
				toDelete: [{ id: 5, original: {} }],
			})
			deleteEvent.req.ip = "10.0.0.0"
			deleteEvent.req.userAgent = "UA"
			const deleteRes = service["generateLogs"](deleteEvent)
			expect(deleteRes[0]).toEqual(expect.objectContaining(commonLog))
			expect(deleteRes).toHaveLength(1)
		})

		it("should create 'create' logs correctly", () => {
			const event = CreateFinishEventStub({
				collection: mockCollectionDefs.posts,
				result: [{ id: 5, title: "hello" }],
			})
			const res = service["generateLogs"](event)
			expect(res[0]).toMatchObject({
				action: "create",
				previousData: {},
				changes: [
					{ op: "add", path: "/id", value: 5 },
					{ op: "add", path: "/title", value: "hello" },
				],
			})
		})

		it("should create 'delete' logs correctly", () => {
			const event = DeleteFinishEventStub({
				collection: mockCollectionDefs.posts,
				result: [{ id: 5 }],
				toDelete: [{ id: 5, original: { id: 5, title: "to-delete" } }],
			})
			const res = service["generateLogs"](event)
			expect(res[0]).toMatchObject({
				action: "delete",
				previousData: { id: 5, title: "to-delete" },
				changes: [
					{ op: "remove", path: "/title" },
					{ op: "remove", path: "/id" },
				],
			})
		})

		it("should create 'update' logs correctly", () => {
			const event = UpdateFinishEventStub({
				collection: mockCollectionDefs.posts,
				result: [{ id: 5, title: "changed" }],
				toUpdate: [
					{
						id: 5,
						original: { id: 5, title: "og", noNew: 5 },
						changed: { id: 5, title: "changed_val" },
					},
				],
			})
			const res = service["generateLogs"](event)
			expect(res[0]).toMatchObject({
				action: "update",
				previousData: { id: 5, title: "og", noNew: 5 },
				changes: [
					{ op: "remove", path: "/noNew" },
					{ op: "replace", path: "/title", value: "changed" },
				],
			})
		})

		it("should throw if update does not have proper previous data", () => {
			const event = UpdateFinishEventStub({
				collection: mockCollectionDefs.posts,
				result: [{ id: 5, title: "changed" }],
				toUpdate: [],
			})
			expect(() => service["generateLogs"](event)).toThrow(InternalServerErrorException)
		})

		it("should throw if delete does not have proper previous data", () => {
			const event = DeleteFinishEventStub({
				collection: mockCollectionDefs.posts,
				result: [{ id: 5, title: "changed" }],
				toDelete: [],
			})
			expect(() => service["generateLogs"](event)).toThrow(InternalServerErrorException)
		})

		it("should handle dates properly", () => {
			const original = { id: 5, date: new Date() }
			const changed = { id: 5, date: addMinutes(original.date, 5) }
			const event = UpdateFinishEventStub({
				collection: mockCollectionDefs.posts,
				result: [changed],
				toUpdate: [{ id: 5, original, changed }],
			})
			const res = service["generateLogs"](event)
			expect(res[0]).toEqual(
				expect.objectContaining({
					previousData: { id: 5, date: original.date.toJSON() },
					changes: [
						{
							op: "replace",
							path: "/date",
							value: changed.date.toJSON(),
						},
					],
				}),
			)
		})
	})
})
