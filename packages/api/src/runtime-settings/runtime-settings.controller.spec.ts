import { buildTestModule } from "@api/testing/build-test-module"
import { ChangeSettingsDto, RuntimeSettingsSchema, Settings } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { DynamicSettingsController } from "./runtime-settings.controller"
import { RuntimeSettingsService } from "./runtime-settings.service"

const getDefaultSettings = (): Settings => ({
	data: RuntimeSettingsSchema.parse({}),
	meta: { signUpDynamic: true },
})

describe("DynamicSettingsController", () => {
	let controller: DynamicSettingsController
	let service: RuntimeSettingsService

	beforeEach(async () => {
		const module = await buildTestModule(DynamicSettingsController).compile()
		controller = module.get(DynamicSettingsController)
		service = module.get(RuntimeSettingsService)
	})

	describe("getSettings", () => {
		beforeEach(() => {
			service.getSettings = vi.fn(() => getDefaultSettings())
		})

		it("should return settings", async () => {
			await expect(controller.getSettings()).resolves.toEqual(getDefaultSettings())
		})
	})

	describe("setSettings", () => {
		beforeEach(() => {
			service.setSettings = vi.fn(async () => getDefaultSettings())
		})
		it("should store settings", async () => {
			const dto = new ChangeSettingsDto({})
			const user = AuthUserStub()
			await controller.changeSettings(dto, user)
			expect(service.setSettings).toBeCalledWith(dto, user)
		})

		it("should set settings", async () => {
			const dto = new ChangeSettingsDto({})
			const user = AuthUserStub()
			const result = await controller.changeSettings(dto, user)
			expect(result).toEqual(getDefaultSettings())
			expect(result).not.toBe(getDefaultSettings())
		})
	})
})
