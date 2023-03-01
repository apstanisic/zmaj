import { RedisService } from "@api/redis/redis.service"
import { SecurityTokensService } from "@api/security-tokens/security-tokens.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { TestingModule } from "@nestjs/testing"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthSessionsService } from "../auth-sessions/auth-sessions.service"
import { AuthenticationConfig } from "../authentication.config"
import { AccountHackedService } from "./account-hacked.service"

describe("AccountHackedService", () => {
	let module: TestingModule
	let service: AccountHackedService
	let usersService: UsersService
	let sessionsService: AuthSessionsService
	let tokensService: SecurityTokensService
	let config: AuthenticationConfig

	beforeEach(async () => {
		module = await buildTestModule(AccountHackedService, [
			{
				provide: RedisService,
				useValue: { createInstance: vi.fn(() => ({ set: vi.fn(), testRedis: true })) },
			},
		]).compile()

		service = module.get(AccountHackedService)
		//
		usersService = module.get(UsersService)
		sessionsService = module.get(AuthSessionsService)
		tokensService = module.get(SecurityTokensService)
		config = module.get(AuthenticationConfig)
	})

	it("should compile", () => {
		expect(service).toBeInstanceOf(AccountHackedService)
	})

	/**
	 *
	 */
	describe("constructor", () => {
		it("should assign redis", () => {
			expect(service["redis"]).toMatchObject({ testRedis: true })
		})
	})

	/**
	 *
	 */
	describe("disableAccount", () => {
		beforeEach(() => {
			usersService.updateUser = vi.fn()
			sessionsService.removeAllUserSessions = vi.fn()
			tokensService.deleteUserTokens = vi.fn()
			config.accessTokenTtlMs = 100_000
		})

		it("should set user status as hacked", async () => {
			await service.disableAccount("user-uuid")
			expect(usersService.updateUser).toBeCalledWith({
				userId: "user-uuid",
				data: { status: "hacked" },
			})
		})

		it("should remove all sessions", async () => {
			await service.disableAccount("user-uuid")
			expect(sessionsService.removeAllUserSessions).toBeCalledWith("user-uuid")
		})

		it("should remove all security tokens", async () => {
			await service.disableAccount("user-uuid")
			expect(tokensService.deleteUserTokens).toBeCalledWith({ userId: "user-uuid" })
		})

		it("should store user id in redis so access tokens become invalid", async () => {
			await service.disableAccount("user-uuid")
			expect(service["redis"]?.set).toBeCalledWith("zmaj:disable-auth:user-uuid", "true", "EX", 110)
		})

		it("should handle if redis is disabled", async () => {
			service["redis"] = undefined
			await expect(service.disableAccount("user-uuid")).resolves.toBeUndefined()
		})
	})
})
