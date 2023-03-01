import { buildTestModule } from "@api/testing/build-test-module"
import { AuthUser, SignUpDto } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InitializeAdminController } from "./initialize-admin.controller"
import { InitializeAdminService } from "./initialize-admin.service"

describe("InitializeAdminController", () => {
	let controller: InitializeAdminController
	let service: InitializeAdminService

	beforeEach(async () => {
		const module = await buildTestModule(InitializeAdminController).compile()

		controller = module.get(InitializeAdminController)
		service = module.get(InitializeAdminService)
	})

	it("should be defined", () => {
		expect(controller).toBeInstanceOf(InitializeAdminController)
	})

	/**
	 *
	 */
	// describe("isInitialized", () => {
	// 	beforeEach(() => {
	// 		service.isAdminInitialized = vi.fn(async () => false)
	// 	})
	// 	it("checks if admin is initialized", async () => {
	// 		const res = await controller.isInitialized()
	// 		expect(res).toEqual({ initialized: false })
	// 	})
	// })

	/**
	 *
	 */
	describe("initializeAdmin", () => {
		let user: AuthUser
		let dto: SignUpDto

		beforeEach(() => {
			dto = new SignUpDto({ email: "test@example.com", password: "password" })
			user = AuthUserStub()
			service.createAdminSafe = vi.fn(async () => user)
		})

		it("should create admin", async () => {
			await controller.initializeAdmin(dto)
			expect(service.createAdminSafe).toBeCalledWith(dto)
		})

		it("should response with created admin", async () => {
			const res = await controller.initializeAdmin(dto)
			expect(res).toEqual(user)
		})
	})
})
