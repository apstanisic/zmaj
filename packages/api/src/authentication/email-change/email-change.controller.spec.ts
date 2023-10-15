import { buildTestModule } from "@api/testing/build-test-module"
import { AuthUser, ChangeEmailDto } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EmailChangeController } from "./email-change.controller"
import { EmailChangeService } from "./email-change.service"

describe("EmailChangeController", () => {
	let controller: EmailChangeController
	let service: EmailChangeService
	//
	let userStub: AuthUser

	beforeEach(async () => {
		const module = await buildTestModule(EmailChangeController).compile()

		userStub = AuthUserStub({ email: "current@example.com" })
		//
		controller = module.get(EmailChangeController)
		//
		service = module.get(EmailChangeService)
		service.setNewEmail = vi.fn(async () => ({ email: "new_email@example.com" }))
		service.requestEmailChange = vi.fn(async (user, data) => ({
			newEmail: data.newEmail,
			currentEmail: user.email,
		}))
	})

	/**
	 *
	 */
	describe("requestEmailChange", () => {
		let dto: ChangeEmailDto
		beforeEach(() => {
			dto = new ChangeEmailDto({
				newEmail: "my_new_email@example.com",
				password: "some-password",
			})
		})

		it("should call service to send email", async () => {
			await controller.requestEmailChange(userStub, dto)
			expect(service.requestEmailChange).toBeCalledWith(userStub, dto)
		})

		it("should return requested email as response", async () => {
			const res = await controller.requestEmailChange(userStub, dto)
			expect(res).toEqual({
				currentEmail: "current@example.com",
				newEmail: "my_new_email@example.com",
			})
		})
		//
	})

	/**
	 *
	 */
	describe("setNewEmail", () => {
		//
		it("should call service to set email", async () => {
			await controller.setNewEmail("token123")
			expect(service.setNewEmail).toBeCalledWith({
				token: "token123",
			})
		})
		it("should return new email", async () => {
			const res = await controller.setNewEmail("new-token")
			expect(res).toEqual({ email: "new_email@example.com" })
		})
	})
})
