import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { buildTestModule } from "@api/testing/build-test-module"
import { ForbiddenException } from "@nestjs/common"
import { TestingModule } from "@nestjs/testing"
import {
	ADMIN_ROLE_ID,
	AuthUser,
	ChangeSettingsDto,
	RuntimeSettingsSchema,
	Settings,
} from "@zmaj-js/common"
import { AuthUserStub, KeyValueStub } from "@zmaj-js/test-utils"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { KeyValueStorageService } from "../key-value-storage/key-value-storage.service"
import { RuntimeSettingsService } from "./runtime-settings.service"

const getDefaultSettings = (): Settings => ({
	data: RuntimeSettingsSchema.parse({}),
	meta: { signUpDynamic: true },
})

describe("RuntimeSettingsService", () => {
	let module: TestingModule
	let service: RuntimeSettingsService

	beforeEach(async () => {
		module = await buildTestModule(RuntimeSettingsService, [
			{
				provide: AuthenticationConfig,
				useValue: {
					allowSignUp: true,
				} satisfies Partial<AuthenticationConfig>,
			},
		]).compile()
		service = module.get(RuntimeSettingsService)
	})

	describe("getSettings", () => {
		beforeEach(() => {
			service["_settings"] = getDefaultSettings()
		})

		it("should return settings", async () => {
			expect(service.getSettings()).toBe(service["_settings"])
		})
	})

	describe("setSettings", () => {
		let keyValService: KeyValueStorageService
		let dto: ChangeSettingsDto
		let adminUser: AuthUser
		beforeEach(() => {
			adminUser = AuthUserStub({ roleId: ADMIN_ROLE_ID })
			dto = { defaultSignUpRole: v4(), signUpAllowed: true }
			keyValService = module.get(KeyValueStorageService)
			keyValService.upsert = vi.fn(async (val) => KeyValueStub({ ...val }))
		})

		it("should throw if user not admin", async () => {
			expect(service.setSettings(new ChangeSettingsDto({}), AuthUserStub())).rejects.toThrow(
				ForbiddenException,
			)
		})

		it("should merge with current settings", async () => {
			const baseSettings = getDefaultSettings()
			service.getSettings = vi.fn(() => baseSettings)

			const newDefaultRole = v4()

			const res = await service.setSettings(
				new ChangeSettingsDto({ defaultSignUpRole: newDefaultRole }),
				adminUser,
			)

			expect(res.data).toEqual({
				signUpAllowed: baseSettings.data.signUpAllowed,
				defaultSignUpRole: newDefaultRole,
			})
		})

		it("should update value in key-value storage", async () => {
			await service.setSettings(dto, AuthUserStub({ roleId: ADMIN_ROLE_ID }))
			expect(keyValService.upsert).toBeCalledWith({
				key: "SETTINGS",
				namespace: "ZMAJ_INTERNAL",
				value: JSON.stringify({ ...service.getSettings().data, ...dto }),
			})
		})

		it("should change state in memory", async () => {
			await service.setSettings(dto, AuthUserStub({ roleId: ADMIN_ROLE_ID }))
			vi.mocked(keyValService.upsert).mockResolvedValue(
				KeyValueStub({ value: JSON.stringify(dto) }),
			)
			const parseSettings = service["parseSettings"].bind(service)
			service["parseSettings"] = vi.fn(parseSettings)
			await service.setSettings(dto, AuthUserStub({ roleId: ADMIN_ROLE_ID }))
			expect(service["_settings"]).toEqual({ data: dto, meta: { signUpDynamic: true } })
		})

		it("should return updated state", async () => {
			await service.setSettings(dto, AuthUserStub({ roleId: ADMIN_ROLE_ID }))
			vi.mocked(keyValService.upsert).mockResolvedValue(
				KeyValueStub({ value: JSON.stringify(dto) }),
			)
			const res = await service.setSettings(dto, AuthUserStub({ roleId: ADMIN_ROLE_ID }))
			expect(res).toEqual({ data: dto, meta: { signUpDynamic: true } })
		})
	})
})
