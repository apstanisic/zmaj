import { Test, TestingModule } from "@nestjs/testing"
import { randDatabaseColumn } from "@ngneat/falso"
import { FieldCreateDto, FieldUpdateDto, UUID } from "@zmaj-js/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { FieldsController } from "./fields.controller"
import { FieldsService } from "./fields.service"

describe("FieldsController", () => {
	let controller: FieldsController
	let service: FieldsService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FieldsController],
			providers: [{ provide: FieldsService, useValue: {} }],
		}).compile()

		controller = module.get(FieldsController)
		service = module.get(FieldsService)
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
	})

	describe("create", () => {
		let dto: FieldCreateDto

		beforeEach(() => {
			dto = new FieldCreateDto({
				// collectionId: v4(),
				columnName: randDatabaseColumn(),
				dataType: "short-text",
				tableName: "posts",
			})
		})

		it("should create field", async () => {
			service.createField = vi.fn().mockResolvedValue("returned")
			const res = await controller.createOne(dto)
			expect(service.createField).toBeCalledWith(dto)
			expect(res).toEqual({ data: "returned" })
		})
	})

	describe("update", () => {
		let dto: FieldUpdateDto
		beforeEach(() => {
			dto = FieldUpdateDto.fromPartial({
				description: "new desc",
			})
		})

		it("should update field", async () => {
			service.updateField = vi.fn().mockResolvedValue("returned")
			const res = await controller.updateById("some-id" as UUID, dto)
			expect(service.updateField).toBeCalledWith("some-id", dto)
			expect(res).toEqual({ data: "returned" })
		})
	})

	describe("delete", () => {
		it("should delete field", async () => {
			service.deleteField = vi.fn().mockResolvedValue("returned")
			const res = await controller.deleteById("some-id" as UUID)
			expect(service.deleteField).toBeCalledWith("some-id")
			expect(res).toEqual({ data: "returned" })
		})
	})
})
