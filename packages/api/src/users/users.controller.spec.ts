import { CrudService } from "@api/crud/crud.service"
import { buildTestModule } from "@api/testing/build-test-module"
import {
	testCreateOne,
	testDeleteById,
	testFindById,
	testFindMany,
	testUpdateById,
} from "@api/testing/crud-controller.helpers"
import { beforeEach, describe, expect, it } from "vitest"
import { UsersController } from "./users.controller"

describe("UsersController", () => {
	let controller: UsersController
	let service: CrudService

	beforeEach(async () => {
		const module = await buildTestModule(UsersController).compile()

		controller = module.get(UsersController)
		service = module.get(CrudService)
	})

	it("should be defined", () => {
		expect(controller).toBeInstanceOf(UsersController)
	})

	it("should findById", () => testFindById({ service, controller }))
	it("should findMany", () => testFindMany({ service, controller }))
	it("should deleteById", () => testDeleteById({ service, controller }))
	it("should updateById", () => testUpdateById({ service, controller, dto: true }))
	it("should createOne", () => testCreateOne({ service, controller, dto: true, factory: true }))
	// it("should createOne", async () => {
	// 	const req = CrudRequestStub()
	// 	const body = new UserCreateDto({ email: "hello@example.com" })
	// 	const createdStub = UserStub()
	// 	userService.createUser = vi.fn(async () => createdStub)
	// 	const res = await controller.createOne(req, body)
	// 	expect(userService.createUser).toBeCalledWith({ data: body })
	// 	expect(res).toEqual<User>(createdStub)
	// })
})
