import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { AuthenticationService } from "@api/authentication/authentication.service"
import { RefreshTokenService } from "@api/authentication/refresh-token.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { InternalServerErrorException } from "@nestjs/common"
import { asMock, AuthUser } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { OidcController } from "./oidc.controller"

describe("OidcController", () => {
	let controller: OidcController
	let authService: AuthenticationService
	let rtService: RefreshTokenService

	beforeEach(async () => {
		const module = await buildTestModule(OidcController, [
			{
				provide: AuthenticationConfig,
				useValue: {
					fullSignInRedirectPath: "http://example.test",
				} as Partial<AuthenticationConfig>,
			},
		]).compile()
		controller = module.get(OidcController)
		authService = module.get(AuthenticationService)
		rtService = module.get(RefreshTokenService)
	})

	describe("redirectToProviderLogin", () => {
		it("should throw 500 if this method is reached", async () => {
			await expect(controller.redirectToProviderLogin()).rejects.toThrow(
				InternalServerErrorException,
			)
		})
	})

	describe("openIdCallback", () => {
		const res = {} as any
		let user: AuthUser

		beforeEach(() => {
			user = AuthUserStub()
			authService.signInWithoutPassword = vi.fn(async () => ({
				refreshToken: "rt",
				accessToken: "at",
			}))
			rtService.set = vi.fn()
		})

		it("should sign in without password", async () => {
			await controller.openIdCallback(res, user, "10.0.0.0", "my-ua")
			expect(authService.signInWithoutPassword).toBeCalledWith(user, {
				ip: "10.0.0.0",
				userAgent: "my-ua",
			})
		})
		it("should set refresh token", async () => {
			asMock(authService.signInWithoutPassword).mockResolvedValue({ refreshToken: "hello" })
			await controller.openIdCallback(res, user, "10.0.0.0", "my-ua")
			expect(rtService.set).toBeCalledWith(res, "hello")
		})
		it("redirect to admin panel path", async () => {
			const redirect = await controller.openIdCallback(res, user, "10.0.0.0", "my-ua")
			expect(redirect).toEqual({ statusCode: 303, url: "http://example.test" })
		})
	})
})
