import { buildTestModule } from "@api/testing/build-test-module"
import { randEmail, randIp, randPassword, randUserAgent } from "@ngneat/falso"
import { AuthUser, SignInDto } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthenticationController } from "./authentication.controller"
import { AuthenticationService } from "./authentication.service"
import { RefreshTokenService } from "./refresh-token.service"

describe("AuthenticationController", () => {
	let controller: AuthenticationController
	let service: AuthenticationService
	let refreshTokenService: RefreshTokenService

	beforeEach(async () => {
		const module = await buildTestModule(AuthenticationController).compile()

		controller = module.get(AuthenticationController)
		service = module.get(AuthenticationService)
		//
		refreshTokenService = module.get(RefreshTokenService)
		refreshTokenService.set = vi.fn()
		refreshTokenService.remove = vi.fn()
	})

	it("should be defined", () => {
		expect(controller).toBeInstanceOf(AuthenticationController)
	})

	/**
	 *
	 */
	describe("signIn", () => {
		let dto: SignInDto
		const response: any = { response: true }
		let ip: string
		let userAgent: string

		beforeEach(() => {
			dto = new SignInDto({ email: randEmail(), password: randPassword() })
			ip = randIp()
			userAgent = randUserAgent()

			service.emailAndPasswordSignIn = vi.fn().mockResolvedValue({
				status: "signed-in",
				refreshToken: "rt",
				accessToken: "at",
				user: AuthUserStub(),
			})
		})

		it("should sign in user", async () => {
			await controller.signIn(dto, response, ip, userAgent)
			expect(service.emailAndPasswordSignIn).toBeCalledWith(dto, { ip, userAgent })
		})

		it("should set cookie", async () => {
			await controller.signIn(dto, response, ip, userAgent)
			expect(refreshTokenService.set).toBeCalledWith(response, "rt")
		})

		it("should not set cookie if user need to provide mfa", async () => {
			service.emailAndPasswordSignIn = vi.fn(() => Promise.resolve({ status: "has-mfa" }))
			await controller.signIn(dto, response, ip, userAgent)
			expect(refreshTokenService.set).not.toBeCalled()
		})

		it("should not set cookie if user must have mfa", async () => {
			service.emailAndPasswordSignIn = vi.fn(() =>
				Promise.resolve({ status: "must-create-mfa", data: {} as any }),
			)
			await controller.signIn(dto, response, ip, userAgent)
			expect(refreshTokenService.set).not.toBeCalled()
		})

		it("should return access token", async () => {
			const res = await controller.signIn(dto, response, ip, userAgent)
			expect(res).toEqual({ accessToken: "at", status: "signed-in", user: expect.any(AuthUser) })
		})
	})

	/**
	 *
	 */
	describe("signOut", () => {
		const response: any = { response: true }

		beforeEach(() => {
			service.signOut = vi.fn(async () => {})
		})

		it("should do nothing if there is no refresh token", async () => {
			await controller.signOut(response, undefined)
			expect(refreshTokenService.remove).not.toBeCalled()
		})

		it("should delete cookie", async () => {
			await controller.signOut(response, "refresh")
			expect(refreshTokenService.remove).toBeCalledWith(response)
		})

		it("should sign user out", async () => {
			await controller.signOut(response, "refresh")
			expect(service.signOut).toBeCalledWith("refresh")
		})

		it("should return success response", async () => {
			const res = await controller.signOut(response, "refresh")
			expect(res).toEqual({ success: true })
		})
	})

	/**
	 *
	 */
	describe("getNewAccessToken", () => {
		it("should get and return access token", async () => {
			service.getNewAccessToken = vi.fn().mockResolvedValue("access-token")
			const res = await controller.getNewAccessToken("refresh-token")
			expect(service.getNewAccessToken).toBeCalledWith("refresh-token")
			expect(res).toEqual({ accessToken: "access-token" })
		})
	})
})
