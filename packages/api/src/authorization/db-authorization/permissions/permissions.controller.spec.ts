import { CrudService } from "@api/crud/crud.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { TestCrudControllers } from "@api/testing/crud-controller.helpers"
import { beforeEach, describe, expect, it } from "vitest"
import { PermissionsController } from "./permissions.controller"

describe("PermissionsController", () => {
	let controller: PermissionsController
	let service: CrudService

	beforeEach(async () => {
		const module = await buildTestModule(PermissionsController).compile()

		controller = module.get(PermissionsController)
		service = module.get(CrudService)
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
	})

	it("should findById", () => TestCrudControllers.testFindById({ service, controller }))
	it("should findMany", () => TestCrudControllers.testFindMany({ service, controller }))
	it("should createOne", () =>
		TestCrudControllers.testCreateOne({ service, controller, dto: true, factory: true }))
	it("should updateById", () =>
		TestCrudControllers.testUpdateById({ service, controller, dto: true }))
	it("should deleteById", () => TestCrudControllers.testDeleteById({ service, controller }))
})
