import { CrudService } from "@api/crud/crud.service"
import { TestCrudControllers } from "@api/testing/crud-controller.helpers"
import { Test, TestingModule } from "@nestjs/testing"
import { beforeEach, describe, expect, it } from "vitest"
import { RolesController } from "./roles.controller"

describe("RolesController", () => {
	let controller: RolesController
	let service: CrudService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RolesController],
			providers: [CrudService],
		})
			.overrideProvider(CrudService)
			.useValue({})
			.compile()

		controller = module.get<RolesController>(RolesController)
		service = module.get(CrudService)
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
	})

	it("should findById", () => TestCrudControllers.testFindById({ service, controller }))
	it("should findMany", () => TestCrudControllers.testFindMany({ service, controller }))
	it("should createOne", () =>
		TestCrudControllers.testCreateOne({ service, controller, dto: true }))
	it("should deleteById", () => TestCrudControllers.testDeleteById({ service, controller }))
	it("should updateById", () =>
		TestCrudControllers.testUpdateById({ service, controller, dto: true }))
})
