import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { throw500 } from "@api/common/throw-http"
import { buildTestModule } from "@api/testing/build-test-module"
import { ForbiddenException } from "@nestjs/common"
import { CollectionDef, FieldDef, FieldMetadata, FieldCreateDto, UUID } from "@zmaj-js/common"
import { FieldDefStub, FieldMetadataStub } from "@zmaj-js/test-utils"
import { Writable } from "type-fest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraStateService } from "../infra-state/infra-state.service"
import { OnInfraChangeService } from "../on-infra-change.service"
import { FieldsService } from "./fields.service"

describe("FieldsService", () => {
	let service: FieldsService
	let appInfraSync: OnInfraChangeService
	let alterSchema: AlterSchemaService
	let infraState: InfraStateService

	beforeEach(async () => {
		const module = await buildTestModule(FieldsService).compile()

		service = module.get(FieldsService)

		infraState = module.get(InfraStateService)
		//
		alterSchema = module.get(AlterSchemaService)
		//
		appInfraSync = module.get(OnInfraChangeService)
		appInfraSync.syncAppAndDb = vi.fn()
		appInfraSync.executeChange = vi.fn(async (fn) => fn())
	})

	it("should compile", () => {
		expect(service).toBeDefined()
	})

	describe("updateField", () => {
		beforeEach(() => {
			service.repo.updateById = vi.fn()
		})
		it("should update field", async () => {
			await service.updateField("some-id" as UUID, { description: "new desc" })
			expect(service.repo.updateById).toBeCalledWith({
				id: "some-id",
				changes: { description: "new desc" },
			})
		})

		it("should sync infra after change", async () => {
			await service.updateField("some-id" as UUID, { description: "new desc" })
			expect(appInfraSync.executeChange).toBeCalled()
		})
	})

	describe("deleteField", () => {
		let id: UUID
		let field: FieldMetadata
		let fullField: Writable<FieldDef>
		beforeEach(() => {
			field = FieldMetadataStub({ columnName: "col", tableName: "tab" })
			fullField = FieldDefStub({
				...field,
				isPrimaryKey: false,
				isForeignKey: false,
				fieldConfig: field.fieldConfig as any,
			})
			id = field.id as UUID
			service.repo.deleteById = vi.fn().mockImplementation(async () => field)
			alterSchema.dropColumn = vi.fn()
			infraState["_fields"] = [...infraState.fields, fullField]
		})

		it("should throw if field is pk", async () => {
			fullField.isPrimaryKey = true
			await expect(service.deleteField(id)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if field is fk", async () => {
			fullField.isForeignKey = true
			await expect(service.deleteField(id)).rejects.toThrow(ForbiddenException)
		})

		it("should delete field from db", async () => {
			await service.deleteField(id)
			expect(service.repo.deleteById).toBeCalledWith({ id, trx: "TEST_TRX" })
		})

		it("should remove column from db schema", async () => {
			await service.deleteField(id)
			expect(alterSchema.dropColumn).toBeCalledWith(
				{ columnName: "col", tableName: "tab" },
				{ trx: "TEST_TRX" },
			)
		})

		it("should migration and sync schema after creating", async () => {
			await service.deleteField(id)
			expect(appInfraSync.executeChange).toBeCalled()
		})
	})

	describe("createField", () => {
		let dto: FieldCreateDto
		let collection: CollectionDef

		beforeEach(() => {
			alterSchema.createColumn = vi.fn()

			dto = new FieldCreateDto({
				// collectionId: v4(),
				tableName: "posts",
				columnName: "col1",
				dataType: "boolean",
				dbDefaultValue: null,
				isNullable: false,
				isUnique: false,
			})
			// collection = CollectionDefStub({ tableName: "table1" })
			collection = infraState.getCollection("posts") ?? throw500(34923)

			service.repo.createOne = vi
				.fn()
				.mockResolvedValue(
					FieldMetadataStub({ tableName: collection.tableName, columnName: dto.columnName }),
				)

			service["infraState"].getCollection = vi.fn().mockReturnValue(collection)
		})

		it("should set default value", async () => {
			dto.dbDefaultValue = "hello_world"
			await service.createField(dto)
			expect(alterSchema.createColumn).toBeCalledWith(
				expect.objectContaining({ defaultValue: { type: "normal", value: "hello_world" } }),
				{ trx: "TEST_TRX" },
			)
		})

		it("should allow adding raw values", async () => {
			dto.dbDefaultValue = "$:NOW()"
			await service.createField(dto)
			expect(alterSchema.createColumn).toBeCalledWith(
				expect.objectContaining({ defaultValue: { type: "raw", value: "NOW()" } }),
				{ trx: "TEST_TRX" },
			)
		})

		it("should create infra field db", async () => {
			await service.createField(dto)
			expect(service.repo.createOne).toBeCalledWith({
				trx: "TEST_TRX",
				data: expect.objectContaining({
					tableName: collection.tableName,
					columnName: dto.columnName,
				}),
			})
		})

		it("should add column to db schema", async () => {
			await service.createField(dto)
			expect(alterSchema.createColumn).toBeCalledWith(
				{
					columnName: "col1",
					dataType: {
						type: "general",
						value: "boolean",
					},
					defaultValue: null,
					nullable: false,
					tableName: "posts",
					unique: false,
				},
				{ trx: "TEST_TRX" },
			)
		})

		it("should run migration after creating", async () => {
			await service.createField(dto)
			expect(appInfraSync.executeChange).toBeCalled()
		})
	})
})
