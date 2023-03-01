import { buildTestModule } from "@api/testing/build-test-module"
import { AuthUser, OtpDisableDto, OtpEnableDto, User } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MfaController } from "./mfa.controller"
import { UsersMfaService } from "./users-mfa.service"

describe("ProfileController", () => {
	let controller: MfaController
	let service: UsersMfaService
	let user: AuthUser
	let fullUser: User

	beforeEach(async () => {
		fullUser = UserStub()
		user = AuthUser.fromUser(fullUser)

		const module = await buildTestModule(MfaController).compile()

		controller = module.get(MfaController)
		service = module.get(UsersMfaService)
	})

	describe("requestEnableOtp", () => {
		beforeEach(() => {
			service.requestToEnableOtp = vi.fn().mockResolvedValue("hello")
		})
		it("should request data needed to enable otp", async () => {
			await controller.requestOtpEnable(user)
			expect(service.requestToEnableOtp).toBeCalledWith(user)
		})

		it("should return response from service", async () => {
			const res = await controller.requestOtpEnable(user)
			expect(res).toEqual("hello")
		})
	})

	describe("enableOtp", () => {
		let dto: OtpEnableDto
		beforeEach(() => {
			dto = new OtpEnableDto({ code: "123456", jwt: "hello_world" })
			service.enableOtp = vi.fn()
		})
		it("should enable otp", async () => {
			await controller.enableOtp(user, dto)
			expect(service.enableOtp).toBeCalledWith({ user, code: dto.code, jwt: dto.jwt })
		})

		it("should return success response", async () => {
			const res = await controller.enableOtp(user, dto)
			expect(res).toEqual({ success: true })
		})
	})

	describe("disableOtp", () => {
		let dto: OtpDisableDto
		beforeEach(() => {
			dto = new OtpDisableDto({ password: "qwerty123" })
			service.disableOtp = vi.fn()
		})
		it("should disable otp", async () => {
			await controller.disableOtp(user, dto)
			expect(service.disableOtp).toBeCalledWith(user, dto.password)
		})

		it("should return success response", async () => {
			const res = await controller.disableOtp(user, dto)
			expect(res).toEqual({ success: true })
		})
	})
})
