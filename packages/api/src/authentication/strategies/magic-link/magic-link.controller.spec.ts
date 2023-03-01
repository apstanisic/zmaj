import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { buildTestModule } from "@api/testing/build-test-module"
import { AuthUser } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { Request, Response } from "express"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MagicLinkController } from "./magic-link.controller"
import { MagicLinkService } from "./magic-link.service"
import { MagicLinkStrategy } from "./magic-link.strategy"

describe("MagicLinkController", () => {
	let controller: MagicLinkController
	let mlStrategy: MagicLinkStrategy
	let mlService: MagicLinkService

	let res: Response
	let req: Request

	beforeEach(async () => {
		const module = await buildTestModule(MagicLinkController, [
			{
				provide: AuthenticationConfig,
				useValue: <Partial<AuthenticationConfig>>{
					fullSignInRedirectPath: "https://redirect.test",
				},
			},
		]).compile()

		req = {} as never
		res = { redirect: vi.fn() } as never
		controller = module.get(MagicLinkController)
		//
		mlStrategy = module.get(MagicLinkStrategy)
		mlService = module.get(MagicLinkService)
	})

	it("should be defined", () => {
		expect(controller).toBeInstanceOf(MagicLinkController)
	})

	/**
	 *
	 */
	describe("magicLoginHandler", () => {
		beforeEach(() => {
			mlStrategy["send"] = vi.fn()
		})

		it("should pass request and response to strategy", async () => {
			await controller.magicLoginHandler(req, res)
			expect(mlStrategy["send"]).toHaveBeenCalledWith(req, res)
		})

		it("should return nothing since strategy send response", async () => {
			const result = await controller.magicLoginHandler(req, res)
			expect(result).toEqual(undefined)
		})
	})

	/**
	 *
	 */
	describe("magicLoginCallback", () => {
		const userAgent = "ua"
		const ip = "10.0.0.0"
		let user: AuthUser

		beforeEach(() => {
			user = AuthUserStub()
			mlService.signIn = vi.fn()
		})

		it("should sign in with user provided from strategy", async () => {
			await controller.magicLoginCallback(res, user, ip, userAgent)
			expect(mlService.signIn).toBeCalledWith(res, user, { userAgent, ip })
		})

		it("should redirect user after successful login", async () => {
			await controller.magicLoginCallback(res, user, ip, userAgent)
			expect(res.redirect).toBeCalledWith(303, "https://redirect.test")
		})
	})
})
