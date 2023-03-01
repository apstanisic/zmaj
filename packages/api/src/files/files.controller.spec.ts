import { CrudService } from "@api/crud/crud.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { TestCrudControllers } from "@api/testing/crud-controller.helpers"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { FilesController } from "./files.controller"
import { FilesService } from "./files.service"

vi.mock("sharp", () => ({ default: vi.fn() }))

describe("FilesController", () => {
	let controller: FilesController
	let crudService: CrudService
	let filesService: FilesService

	beforeEach(async () => {
		const module = await buildTestModule(FilesController).compile()

		controller = module.get(FilesController)
		crudService = module.get(CrudService)
		//
		filesService = module.get(FilesService)
		filesService.getEnabledProviders = vi.fn(() => ["hello"])
		filesService.getFolders = vi.fn(async () => ["f1", "f2"])
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
	})

	it("should findById", () =>
		TestCrudControllers.testFindById({ service: crudService, controller }))
	it("should findMany", () =>
		TestCrudControllers.testFindMany({ service: crudService, controller }))
	it("should deleteById", () =>
		TestCrudControllers.testDeleteById({ service: crudService, controller }))
	it("should updateById", () =>
		TestCrudControllers.testUpdateById({ service: crudService, controller, dto: true }))

	describe("getProviders", () => {
		it("should return enabled providers", () => {
			const result = controller.getProviders()
			expect(result).toEqual({ data: ["hello"] })
		})
	})

	describe("getFolders", () => {
		it("should return folders", async () => {
			const result = await controller.getFolders()
			expect(result).toEqual({ data: ["f1", "f2"] })
		})
	})
})
