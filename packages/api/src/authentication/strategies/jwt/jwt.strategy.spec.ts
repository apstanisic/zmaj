import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { RedisService } from "@api/redis/redis.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { ForbiddenException, InternalServerErrorException } from "@nestjs/common"
import { asMock, AuthUser, AuthUserType } from "@zmaj-js/common"
import { ExtractJwt } from "passport-jwt"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { JwtStrategy } from "./jwt.strategy"

describe("JwtStrategy", () => {
	let strategy: JwtStrategy
	let redisService: RedisService
	let globalConfig: GlobalConfig
	let authnConfig: AuthenticationConfig

	beforeEach(async () => {
		const module = await buildTestModule(JwtStrategy, [
			{ provide: GlobalConfig, useClass: GlobalConfig },
			{ provide: AuthenticationConfig, useClass: AuthenticationConfig },
			{
				provide: RedisService,
				useValue: {
					createInstance: vi.fn(() => ({ redis1: true })),
				} as Record<keyof RedisService, any>,
			},
		]).compile()

		strategy = module.get(JwtStrategy)
		redisService = module.get(RedisService)
		globalConfig = module.get(GlobalConfig)
		authnConfig = module.get(AuthenticationConfig)
	})

	it("should be defined", () => {
		expect(strategy).toBeInstanceOf(JwtStrategy)
	})

	/**
	 *
	 */
	describe("constructor", () => {
		beforeEach(() => {
			ExtractJwt.fromAuthHeaderAsBearerToken = vi.fn()
			ExtractJwt.fromUrlQueryParameter = vi.fn()
		})

		it("should allow url from query if allowed in config", () => {
			authnConfig.allowJwtInQuery = true
			new JwtStrategy(globalConfig, redisService, authnConfig)
			expect(ExtractJwt.fromUrlQueryParameter).toBeCalledWith("accessToken")
		})

		it("should forbid url from query if forbidden in config", () => {
			authnConfig.allowJwtInQuery = false
			new JwtStrategy(globalConfig, redisService, authnConfig)
			expect(ExtractJwt.fromUrlQueryParameter).not.toBeCalled()
		})

		it("should assign redis instance if possible", () => {
			expect(strategy["redis"]).toEqual({ redis1: true })
		})
	})

	/**
	 *
	 */
	describe("validate", () => {
		let user: AuthUserType
		beforeEach(() => {
			strategy["redis"]!.get = vi.fn(async () => null)
			user = { email: "hello@world.com", userId: v4(), roleId: v4() }
		})

		it("should throw if access token is disabled", async () => {
			asMock(strategy.redis!.get).mockResolvedValue("some-string")
			await expect(strategy.validate(user)).rejects.toThrow(ForbiddenException)
		})

		it("should return user", async () => {
			const res = await strategy.validate(user)
			expect(res).toEqual(user)
			expect(res).toBeInstanceOf(AuthUser)
		})

		it("should throw if there is invalid data in token", async () => {
			await expect(strategy.validate({ ...user, email: "not_an_email" })).rejects.toThrow(
				InternalServerErrorException,
			)
		})
	})
})
