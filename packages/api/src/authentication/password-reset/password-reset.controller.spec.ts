import { GlobalConfig } from "@api/app/global-app.config"
import { buildTestModule } from "@api/testing/build-test-module"
import { AnyFn, Email, qsStringify, type UUID } from "@zmaj-js/common"
import { Response } from "express"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PasswordResetController } from "./password-reset.controller"
import { PasswordResetService } from "./password-reset.service"

vi.mock("@zmaj-js/common", async () => ({
	// ...vi.requireActual("@zmaj-js/common"), //
	...(await vi.importActual<typeof import("@zmaj-js/common")>("@zmaj-js/common")),
	minFnDuration: vi.fn(async (ms, fn: AnyFn) => fn()),
}))

describe("PasswordResetController", () => {
	let controller: PasswordResetController
	let service: PasswordResetService
	let globalConfig: GlobalConfig

	beforeEach(async () => {
		const module = await buildTestModule(PasswordResetController).compile()

		controller = module.get(PasswordResetController)
		service = module.get(PasswordResetService)
		//
		globalConfig = module.get(GlobalConfig)
		globalConfig.joinWithAdminPanelUrl = vi.fn((v) => `http://test.com/${v}`)
	})

	it("should compile", () => {
		expect(controller).toBeInstanceOf(PasswordResetController)
	})

	describe("sendPasswordRecoveryMail", () => {
		const email = "email@example.com" as Email
		beforeEach(() => {
			service.sendResetPasswordEmail = vi.fn()
		})

		it("should send email", async () => {
			await controller.sendPasswordRecoveryMail(email)
			expect(service.sendResetPasswordEmail).toBeCalledWith(email)
		})

		// currently all paths send some kind of email
		// it("should ensure minimal duration", async () => {
		// 	await controller.sendPasswordRecoveryMail(email)
		// 	expect(minFnDuration).toBeCalledWith(3000, expect.any(Function))
		// })

		it("should return requested email as response", async () => {
			const res = await controller.sendPasswordRecoveryMail(email)
			expect(res).toEqual({ email })
		})
	})

	describe("renderPasswordResetForm", () => {
		let res: Response
		const token = v4() as UUID
		const email = "email@example.com" as Email

		beforeEach(() => {
			res = { redirect: vi.fn() } as any
		})

		it("should redirect to admin panel with password reset form", () => {
			controller.renderPasswordResetForm(res, token)
			expect(res.redirect).toBeCalledWith(
				303,
				`http://test.com/#/auth/password-reset?${qsStringify({ token })}`,
			)
		})
	})

	describe("resetPassword", () => {
		beforeEach(() => {
			service.setNewPassword = vi.fn()
		})
		it("should change password in db", async () => {
			const params = { email: "email@example.com", password: "pass1234", token: v4() }
			await controller.resetPassword(params)
			expect(service.setNewPassword).toBeCalledWith(params)
		})

		it("should return success response", async () => {
			const params = { email: "email@example.com", password: "pass1234", token: v4() }
			const res = await controller.resetPassword(params)
			expect(res).toEqual({ success: true })
		})
	})
})
