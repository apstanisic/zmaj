import { CrudService } from "@api/crud/crud.service"
import { TestCrudControllers } from "@api/testing/crud-controller.helpers"
import { Test } from "@nestjs/testing"
import { ActivityLog } from "@zmaj-js/common"
import { beforeEach, describe, expect, it } from "vitest"
import { ActivityLogController } from "./activity-log.controller"

describe("ActivityLogController", () => {
	let controller: ActivityLogController
	let service: CrudService<ActivityLog>

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [ActivityLogController],
			providers: [CrudService],
		})
			.overrideProvider(CrudService)
			.useValue({})
			.compile()

		controller = module.get(ActivityLogController)
		service = module.get(CrudService)
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
		expect(service).toBeDefined()
	})

	it("should findById", () => TestCrudControllers.testFindById({ service, controller }))
	it("should findMany", () => TestCrudControllers.testFindMany({ service, controller }))
	it("should deleteById", () => TestCrudControllers.testDeleteById({ service, controller }))
})
