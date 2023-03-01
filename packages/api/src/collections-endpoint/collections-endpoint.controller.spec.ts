import { CrudService } from "@api/crud/crud.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { TestCrudControllers } from "@api/testing/crud-controller.helpers"
import { beforeEach, describe, expect, it } from "vitest"
import { CollectionsEndpointController } from "./collections-endpoint.controller"

describe("CollectionsEndpointController", () => {
	let controller: CollectionsEndpointController
	let service: CrudService

	beforeEach(async () => {
		const module = await buildTestModule(CollectionsEndpointController).compile()

		controller = module.get(CollectionsEndpointController)
		service = module.get(CrudService)
	})

	it("should be defined", () => {
		expect(controller).toBeInstanceOf(CollectionsEndpointController)
	})

	it("should findById", () => TestCrudControllers.testFindById({ service, controller }))
	it("should findMany", () => TestCrudControllers.testFindMany({ service, controller }))
	it("should createOne", () => TestCrudControllers.testCreateOne({ service, controller }))
	it("should deleteById", () => TestCrudControllers.testDeleteById({ service, controller }))
	it("should updateById", () => TestCrudControllers.testUpdateById({ service, controller }))
})
