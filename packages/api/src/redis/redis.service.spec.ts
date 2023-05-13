import { buildTestModule } from "@api/testing/build-test-module"
import { asMock, times } from "@zmaj-js/common"
import { Redis } from "ioredis"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RedisConfig } from "./redis.config"
import { RedisService } from "./redis.service"

vi.mock("ioredis")

describe("RedisService", () => {
	let service: RedisService
	let config: RedisConfig

	beforeEach(async () => {
		let i = 0

		// For every test we are setting up new implementation that returns current `i` for that test
		asMock(Redis)
			.mockClear()
			.mockImplementation(() => ({ id: ++i, quit: vi.fn() } as any))

		const module = await buildTestModule(RedisService, [
			{
				provide: RedisConfig,
				useValue: new RedisConfig({ enabled: true }, { get: () => undefined } as any),
			},
		]).compile()

		service = module.get(RedisService)
		config = module.get(RedisConfig)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(RedisService)
	})

	describe("createInstance", () => {
		it("should return undefined if redis is disabled", () => {
			config.enabled = false
			expect(service.createInstance()).toBeUndefined()
			expect(Redis).not.toBeCalled()
		})

		it("should return new instance of ioredis", () => {
			expect(service.createInstance()).toMatchObject({ id: 1 })
			expect(service.createInstance()).toMatchObject({ id: 2 })
		})

		it("should pass params to ioredis", () => {
			config.username = "test"
			config.password = "password"
			service.createInstance()
			expect(Redis).toBeCalledWith(6379, "127.0.0.1", {
				username: "test",
				password: "password",
			})
		})

		it("should push new instance to to instances", () => {
			const inst1 = service.createInstance()
			const inst2 = service.createInstance()

			expect(service["instances"][0]).toBe(inst1)
			expect(service["instances"][1]).toBe(inst2)
		})
	})

	describe("onModuleDestroy", () => {
		it("should kill all connections when app is destroyed", async () => {
			// toMock(Redis).mockImplementation(() => ({ quit: vi.fn() }))

			times(5, () => service.createInstance())

			await service.onModuleDestroy()

			for (const instance of service["instances"]) {
				expect(instance.quit).toBeCalled()
			}

			expect.assertions(5)
		})
	})
})
