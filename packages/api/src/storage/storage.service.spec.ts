import { ConfigService } from "@api/config/config.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { InternalServerErrorException } from "@nestjs/common"
import { throwErr } from "@zmaj-js/common"
import { FileStorageManager } from "@zmaj-js/storage-core"
import { beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { StorageConfig } from "./storage.config"
import { StorageService } from "./storage.service"

vi.mock("@zmaj-js/storage-s3")
vi.mock("@zmaj-js/storage-core", async () => {
	const actual = await vi.importActual<typeof import("@zmaj-js/storage-core")>(
		"@zmaj-js/storage-core",
	)
	return {
		BaseStorage: actual.BaseStorage,
		BaseStorageConfigSchema: actual.BaseStorageConfigSchema,
		GenericStorageConfigSchema: actual.GenericStorageConfigSchema,
		FileStorageManager: vi.fn().mockImplementation(() => ({ fsm: true, enabledProviders: ["p1"] })),
	}
})

// vi.mock("fs-extra")
// vi.mock("@aws-sdk/client-s3")

describe("StorageService", () => {
	let service: StorageService
	let storageConfig: StorageConfig

	beforeEach(async () => {
		const module = await buildTestModule(StorageService, [
			{
				provide: StorageConfig,
				useValue: new StorageConfig({}, { getGroups: () => ({}) } as Partial<ConfigService> as any),
			},
		]).compile()

		service = module.get(StorageService)
		storageConfig = module.get(StorageConfig)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(StorageService)
	})

	/**
	 *
	 */
	describe("initializeProviders", () => {
		beforeEach(() => {
			vi.mocked(FileStorageManager).mockClear()
		})

		it("call FileStorageManager properly", () => {
			storageConfig.providers.push(
				{ name: "hello", type: "local", uploadDisabled: false },
				{ name: "world", type: "s3", uploadDisabled: false },
			)
			storageConfig.adapters = [1, 2] as any
			service["initializeProviders"]()
			expect(FileStorageManager).toBeCalledWith({
				adapters: [expect.any(Function), 1, 2],
				defaultProvider: "hello",
				providers: {
					hello: { name: "hello", type: "local", uploadDisabled: false },
					world: { name: "world", type: "s3", uploadDisabled: false },
				},
			})
		})

		it("should not use default storage if forbidden", () => {
			service["initializeProviders"]()
			expect(FileStorageManager).toBeCalledWith({
				adapters: expect.anything(),
				providers: {},
			})
		})

		it("should default to local storage if enabled", () => {
			storageConfig.enableFallbackStorage = true
			service["initializeProviders"]()
			expect(FileStorageManager).toBeCalledWith({
				adapters: expect.anything(),
				providers: {
					default: {
						basePath: "files",
						name: "default",
						type: "local",
						uploadDisabled: false,
					},
				},
			})
		})

		it("should return manager", () => {
			const res = service["initializeProviders"]()
			expect(res).toMatchObject({ fsm: true })
		})
	})

	/**
	 *
	 */
	describe("provider", () => {
		let getProvider: Mock

		beforeEach(() => {
			getProvider = vi.fn(() => 5)
			service["storageManager"].provider = getProvider
		})

		it("should return provider if exists", () => {
			const res = service.provider("hello")
			expect(res).toEqual(5)
		})

		it("should throw if provider does not exists", () => {
			getProvider.mockImplementation(() => throwErr())
			expect(() => service.provider("hello")).toThrow(InternalServerErrorException)
		})
	})

	/**
	 *
	 */
	describe("enabledProviders", () => {
		it("should get all enabled providers", () => {
			const providers = service.enabledProviders
			expect(providers).toEqual(["p1"])
		})
	})
})
