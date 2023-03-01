import { InternalServerErrorException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppRestartService } from "./app-restart.service"

describe("RestartAppService", () => {
	let service: AppRestartService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AppRestartService],
		}).compile()

		service = module.get<AppRestartService>(AppRestartService)
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})

	describe("restart", () => {
		it("should throw if restart fn not implemented", async () => {
			await expect(service.restart()).rejects.toThrow(InternalServerErrorException)
		})

		it("should not do anything if restart process already started", async () => {
			service["isRestarting"] = true
			service["restartFn"] = vi.fn()
			await service.restart()
			expect(service["restartFn"]).not.toBeCalled()
		})

		it("should disable multiple restarts", async () => {
			expect(service["isRestarting"]).toBe(false)

			service["restartFn"] = vi.fn()
			await service.restart()
			expect(service["isRestarting"]).toBe(true)
		})

		it("should restart app", async () => {
			service["restartFn"] = vi.fn()
			await service.restart()
			expect(service["restartFn"]).toHaveBeenCalled()
		})
	})

	/**
	 *
	 */
	describe("registerRestartImplementation", () => {
		it("should register function first time", () => {
			const fn = vi.fn()
			service.registerRestartImplementation(fn)
			expect(service["restartFn"]).toBe(fn)
		})

		it("should throw on multiple registration", () => {
			expect(() => {
				service.registerRestartImplementation(async () => undefined)
				service.registerRestartImplementation(async () => undefined)
			}).toThrow(InternalServerErrorException)
		})
	})
})
