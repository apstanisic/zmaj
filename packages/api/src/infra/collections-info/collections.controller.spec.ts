import { buildTestModule } from "@api/testing/build-test-module"
import { CollectionCreateDto, CollectionUpdateDto, UUID } from "@zmaj-js/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CollectionsController } from "./collections.controller"
import { CollectionsService } from "./collections.service"

describe("CollectionsController", () => {
	let controller: CollectionsController
	let service: CollectionsService
	beforeEach(async () => {
		const module = await buildTestModule(CollectionsController).compile()

		controller = module.get(CollectionsController)
		service = module.get(CollectionsService)
	})

	it("should compile", () => {
		expect(controller).toBeDefined()
	})

	describe("createOne", () => {
		const dto: CollectionCreateDto = "dto" as any
		beforeEach(() => {
			service.createCollection = vi.fn().mockResolvedValue("created_collection")
		})
		//
		it("should create collection", async () => {
			await controller.createOne(dto)
			expect(service.createCollection).toBeCalledWith(dto)
		})

		it("should return created collection", async () => {
			const res = await controller.createOne(dto)
			expect(res).toEqual({ data: "created_collection" })
		})
	})

	/**
	 *
	 */
	describe("deleteById", () => {
		beforeEach(() => {
			service.removeCollection = vi.fn().mockResolvedValue("removed_collection")
		})
		//
		it("should delete collection", async () => {
			await controller.deleteById("id" as UUID)
			expect(service.removeCollection).toBeCalledWith("id")
		})

		it("should return deleted collection", async () => {
			const res = await controller.deleteById("id" as UUID)
			expect(res).toEqual({ data: "removed_collection" })
		})
	})

	/**
	 *
	 */
	describe("updateById", () => {
		let dto: CollectionUpdateDto

		beforeEach(() => {
			service.updateCollection = vi.fn().mockResolvedValue("updated")
			dto = new CollectionUpdateDto({ label: "hello" })
		})

		//
		it("should update collection", async () => {
			await controller.updateById("id" as UUID, dto)
			expect(service.updateCollection).toBeCalledWith("id", dto)
		})

		it("should return updated collection", async () => {
			const res = await controller.updateById("id" as UUID, dto)
			expect(res).toEqual({ data: "updated" })
		})
	})
})
