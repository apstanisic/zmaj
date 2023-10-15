import { buildTestModule } from "@api/testing/build-test-module"
import { ForbiddenException } from "@nestjs/common"
import { asMock, AuthUser, SignUpDto } from "@zmaj-js/common"
import { AuthUserStub, UserStub } from "@zmaj-js/test-utils"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthenticationConfig } from "../authentication.config"
import { SignUpController } from "./sign-up.controller"
import { SignUpService } from "./sign-up.service"

describe("SignUpController", () => {
	let controller: SignUpController
	let service: SignUpService
	let authConfig: AuthenticationConfig
	let user: AuthUser

	beforeEach(async () => {
		const module = await buildTestModule(SignUpController).compile()

		controller = module.get(SignUpController)
		//
		service = module.get(SignUpService)
		service.signUp = vi.fn(async () => UserStub())
		authConfig = module.get(AuthenticationConfig)
		authConfig.allowSignUp = true
		//
		user = AuthUserStub()
	})

	it("should compile", () => {
		expect(controller).toBeInstanceOf(SignUpController)
	})

	/**
	 *
	 */
	describe("signUp", () => {
		let dto: SignUpDto

		beforeEach(() => {
			dto = new SignUpDto({ email: "test_me@example.com", password: "password" })
		})

		it("should throw if user is logged in", async () => {
			await expect(controller.signUp(dto, user)).rejects.toThrow(ForbiddenException)
		})

		it("should call service to sign up", async () => {
			await controller.signUp(dto)
			expect(service.signUp).toBeCalledWith(dto)
		})

		it("should return auth user", async () => {
			const roleId = v4()
			const userId = v4()
			asMock(service.signUp).mockResolvedValue({
				email: "test_me@example.com",
				id: userId,
				roleId,
			})
			const res = await controller.signUp(dto)
			expect(res).toEqual(new AuthUser({ email: "test_me@example.com", userId, roleId }))
		})
		//
	})

	/**
	 *
	 */
	describe("isSignUpAllowed", () => {
		it("should return info about sign up status", async () => {
			authConfig.allowSignUp = false
			const res = await controller.isSignUpAllowed()
			expect(res).toEqual({ allowed: false })
		})
	})
})
