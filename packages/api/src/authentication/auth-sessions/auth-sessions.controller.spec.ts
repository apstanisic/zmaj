import { buildTestModule } from "@api/testing/build-test-module"
import { AuthUser, Struct, UUID } from "@zmaj-js/common"
import { AuthUserStub, ReadUrlQueryStub } from "@zmaj-js/test-utils"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthSessionsApiService } from "./auth-sessions.api.service"
import { AuthSessionsController } from "./auth-sessions.controller"

describe("AuthSessionsController", () => {
	let controller: AuthSessionsController
	let service: AuthSessionsApiService
	//
	let userStub: AuthUser

	beforeEach(async () => {
		const module = await buildTestModule(AuthSessionsController).compile()

		userStub = AuthUserStub()

		controller = module.get(AuthSessionsController)
		service = module.get(AuthSessionsApiService)
	})

	it("should be defined", () => {
		expect(controller).toBeInstanceOf(AuthSessionsController)
	})

	/**
	 *
	 */
	describe("getAll", () => {
		let query: Struct
		beforeEach(() => {
			service.getUserSessions = vi.fn().mockResolvedValue([{ id: "123" }])
			query = ReadUrlQueryStub()
		})
		it("should pass sessions from service", async () => {
			const res = await controller.getSessions(userStub, query)
			expect(service.getUserSessions).toBeCalledWith(userStub, query)
			expect(res).toEqual([{ id: "123" }])
		})
	})

	/**
	 *
	 */
	describe("findById", () => {
		beforeEach(() => {
			service.findById = vi.fn().mockResolvedValue({ id: "found_1" })
		})

		it("should get auth session by id", async () => {
			const id = v4() as UUID

			const res = await controller.findById(userStub, id)
			expect(service.findById).toBeCalledWith(id, userStub)
			expect(res).toEqual({ data: { id: "found_1" } })
		})
	})

	describe("deleteSession", () => {
		const id = v4() as UUID

		beforeEach(() => {
			service.removeById = vi.fn().mockResolvedValue({ id: "deleted_1" })
		})

		it("should remove session by id", async () => {
			await controller.revoke(id, userStub)
			expect(service.removeById).toBeCalledWith(id, userStub)
		})

		it("should return deleted session", async () => {
			const res = await controller.revoke(id, userStub)
			expect(res).toEqual({ data: { id: "deleted_1" } })
		})
	})
})
