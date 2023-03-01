import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, ForbiddenException } from "@nestjs/common"
import { asMock, AuthUser, User } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
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
		const params = ["email@example.com", "password"] as const

		beforeEach(() => {
			userStub = UserStub()
			authnService.getSignInUser = vi.fn(async () => userStub)
		})

		it("should throw if basic auth is not allowed", async () => {
			authnConfig.allowBasicAuth = false
			await expect(strategy.validate(...params)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if credentials are invalid", async () => {
			asMock(authnService.getSignInUser).mockRejectedValue(new BadRequestException())
			await expect(strategy.validate(...params)).rejects.toThrow(BadRequestException)
		})

		it("should get user with provided credentials", async () => {
			await strategy.validate(...params)
			expect(authnService.getSignInUser).toBeCalledWith(
				expect.objectContaining({ email: params[0], password: params[1] }),
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
