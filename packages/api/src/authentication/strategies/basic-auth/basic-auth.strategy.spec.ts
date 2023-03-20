import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, ForbiddenException } from "@nestjs/common"
import { asMock, AuthUser, User } from "@zmaj-js/common"
import { AuthUserStub, UserStub } from "@zmaj-js/test-utils"
import { Request } from "express"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthenticationService } from "../../authentication.service"
import { BasicAuthStrategy } from "./basic-auth.strategy"

describe("BasicAuthStrategy", () => {
	let strategy: BasicAuthStrategy
	let authnService: AuthenticationService
	let authnConfig: AuthenticationConfig

	beforeEach(async () => {
		const module = await buildTestModule(BasicAuthStrategy).compile()

		strategy = module.get(BasicAuthStrategy)
		authnService = module.get(AuthenticationService)
		//
		authnConfig = module.get(AuthenticationConfig)
		authnConfig.allowBasicAuth = true
	})

	/**
	 *
	 */
	describe("validate", () => {
		let userStub: User
		const req = { ip: "1.1.1.1", headers: { "user-agent": "Hello" } } as Request
		const params = [req, "email@example.com", "password"] as const

		beforeEach(() => {
			userStub = UserStub()
			authnService.emailAndPasswordSignIn = vi.fn(async () => ({
				status: "signed-in" as const,
				user: AuthUser.fromUser(userStub),
				accessToken: "at",
			}))
		})

		it("should throw if basic auth is not allowed", async () => {
			authnConfig.allowBasicAuth = false
			await expect(strategy.validate(...params)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if credentials are invalid", async () => {
			asMock(authnService.emailAndPasswordSignIn).mockRejectedValue(new BadRequestException())
			await expect(strategy.validate(...params)).rejects.toThrow(BadRequestException)
		})

		it("should get user with provided credentials", async () => {
			await strategy.validate(...params)
			expect(authnService.emailAndPasswordSignIn).toBeCalledWith(
				expect.objectContaining({ email: "email@example.com", password: "password" }),
				{ ip: "1.1.1.1", userAgent: req.headers["user-agent"], expiresAt: expect.any(Date) },
			)
		})

		it("should return auth user if login is valid", async () => {
			const res = await strategy.validate(...params)

			expect(res).toEqual(<AuthUser>{
				email: userStub.email,
				roleId: userStub.roleId,
				userId: userStub.id,
			})
		})
	})
})
