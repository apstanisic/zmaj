import { buildTestModule } from "@api/testing/build-test-module"
import { asMock, AuthUser, type UUID } from "@zmaj-js/common"
import {
	AuthUserStub,
	mockCollectionConsts,
	mockFieldsConsts,
	mockCollectionDefs,
	mockFieldDefs,
	mockRelationDefs,
	mockRelationsConsts,
} from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraController } from "./infra.controller"
import { UserInfraService } from "./user-infra.service"

describe("InfraController", () => {
	let controller: InfraController
	let service: UserInfraService
	let user: AuthUser

	beforeEach(async () => {
		const module = await buildTestModule(InfraController).compile()

		controller = module.get(InfraController)
		service = module.get(UserInfraService)

		service.getInfra = vi.fn().mockReturnValue(Object.values(mockCollectionDefs))

		user = AuthUserStub()
	})

	describe("getCollections", () => {
		beforeEach(() => {
			asMock(service.getInfra).mockResolvedValue("result")
		})
		it("should get collections", async () => {
			const res = await controller.getCollections(user)
			expect(res).toEqual({ data: "result" })
			expect(service.getInfra).toBeCalledWith(user)
		})

		it("should only get allowed data", async () => {
			await controller.getCollections(user)
			expect(service.getInfra).toBeCalledWith(user)
		})
	})

	describe("getCollectionById", () => {
		const id = mockCollectionConsts.posts.id as UUID

		it("should get collection", async () => {
			const res = await controller.getCollectionById(id, user)
			expect(res).toEqual({ data: mockCollectionDefs.posts })
		})

		it("should only get allowed data", async () => {
			await controller.getCollectionById(id, user)
			expect(service.getInfra).toBeCalledWith(user)
		})
	})

	describe("getFieldById", () => {
		const id = mockFieldsConsts.posts.body.id as UUID

		it("should only get allowed data", async () => {
			await controller.getFieldById(id, user)
			expect(service.getInfra).toBeCalledWith(user)
		})

		it("should get field", async () => {
			const res = await controller.getFieldById(id, user)
			expect(res).toEqual({ data: mockFieldDefs.posts.body })
		})
	})

	describe("getRelationById", () => {
		const id = mockRelationsConsts.posts.comments.id as UUID

		it("should only get allowed data", async () => {
			await controller.getRelationById(id, user)
			expect(service.getInfra).toBeCalledWith(user)
		})

		it("should get relation", async () => {
			const res = await controller.getRelationById(id, user)
			expect(res).toEqual({ data: mockRelationDefs.posts.comments })
		})
	})
})
