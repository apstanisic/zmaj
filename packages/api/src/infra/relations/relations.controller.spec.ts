import { buildTestModule } from "@api/testing/build-test-module"
import { RelationCreateDto, RelationUpdateDto, UUID } from "@zmaj-js/common"
import { RelationDefStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RelationsController } from "./relations.controller"
import { RelationsService } from "./relations.service"

describe("RelationsController", () => {
	let controller: RelationsController
	let service: RelationsService
	beforeEach(async () => {
		const module = await buildTestModule(RelationsController).compile()

		controller = module.get(RelationsController)
		service = module.get(RelationsService)
	})

	it("should compile", () => {
		expect(controller).toBeDefined()
	})

	describe("createRelation", () => {
		let dto: RelationCreateDto
		beforeEach(() => {
			service.createRelation = vi.fn().mockResolvedValue("created_relation")
			dto = new RelationCreateDto({
				left: { column: "lc", propertyName: "lpn" },
				right: { column: "rc", propertyName: "rpn" },
				leftCollection: "lt",
				rightCollection: "rt",
				type: "many-to-one",
			})
		})
		//
		it("should create relation", async () => {
			await controller.createRelation(dto)
			expect(service.createRelation).toBeCalledWith(dto)
		})

		it("should return created relation", async () => {
			const res = await controller.createRelation(dto)
			expect(res).toEqual({ data: "created_relation" })
		})
	})

	/**
	 *
	 */
	describe("deleteRelation", () => {
		beforeEach(() => {
			service.deleteRelation = vi.fn().mockResolvedValue("deleted_relation")
		})
		//
		it("should delete relation", async () => {
			await controller.deleteRelation("id" as UUID)
			expect(service.deleteRelation).toBeCalledWith("id")
		})

		it("should return deleted relation", async () => {
			const res = await controller.deleteRelation("id" as UUID)
			expect(res).toEqual({ data: "deleted_relation" })
		})
	})

	/**
	 *
	 */
	describe("updateRelation", () => {
		let dto: RelationUpdateDto

		beforeEach(() => {
			service.updateRelation = vi.fn().mockResolvedValue("updated_relation")
			dto = new RelationUpdateDto({ label: "hello" })
		})

		//
		it("should update relation", async () => {
			await controller.updateRelation("id" as UUID, dto)
			expect(service.updateRelation).toBeCalledWith("id", dto)
		})

		it("should return updated relation", async () => {
			const res = await controller.updateRelation("id" as UUID, dto)
			expect(res).toEqual({ data: "updated_relation" })
		})
	})

	/**
	 *
	 */
	describe("splitManyToMany", () => {
		const mockRel = [RelationDefStub(), RelationDefStub()]
		beforeEach(() => {
			service.splitManyToMany = vi.fn(async () => mockRel as any)
		})

		//
		it("should split relation", async () => {
			await controller.splitManyToMany("junction")
			expect(service.splitManyToMany).toBeCalledWith("junction")
		})

		it("should return split relation (side that id is provided)", async () => {
			const res = await controller.splitManyToMany("junction")
			expect(res).toEqual({ data: mockRel })
		})
	})

	/**
	 *
	 */
	describe("joinManyToMany", () => {
		beforeEach(() => {
			service.joinManyToMany = vi.fn().mockResolvedValue(["rel1", "rel2"])
		})

		//
		it("should join relation", async () => {
			await controller.joinManyToMany("junctionCollection")
			expect(service.joinManyToMany).toBeCalledWith("junctionCollection")
		})

		it("should return m2m relations", async () => {
			const res = await controller.joinManyToMany("col")
			expect(res).toEqual({ data: ["rel1", "rel2"] })
		})
	})
})
