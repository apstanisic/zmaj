import { CrudService } from "@api/crud/crud.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { TestCrudControllers } from "@api/testing/crud-controller.helpers"
import { beforeEach, describe, expect, it } from "vitest"
import { WebhooksController } from "./webhooks.controller"

describe("WebhooksController", () => {
	let controller: WebhooksController
	let service: CrudService

	beforeEach(async () => {
		const module = await buildTestModule(WebhooksController).compile()

		controller = module.get(WebhooksController)
		service = module.get(CrudService)
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
		expect(service).toBeDefined()
	})

	it("should findById", () => TestCrudControllers.testFindById({ service, controller }))
	it("should findMany", () => TestCrudControllers.testFindMany({ service, controller }))
	it("should createOne", () =>
		TestCrudControllers.testCreateOne({ service, controller, dto: true, factory: true }))
	it("should deleteById", () => TestCrudControllers.testDeleteById({ service, controller }))
	it("should updateById", () =>
		TestCrudControllers.testUpdateById({ service, controller, dto: true }))
})
