import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { DbColumn, CollectionMetadata, FieldMetadata, times } from "@zmaj-js/common"
import { DbColumnStub, CollectionMetadataStub, FieldMetadataStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraService } from "../infra.service"
import { InfraSchemaFieldsSyncService } from "./infra-schema-fields-sync.service"

describe("InfraSchemaFieldsSyncService", () => {
	let service: InfraSchemaFieldsSyncService
	let infraService: InfraService
	let schemaInfoS: SchemaInfoService
	let repo: OrmRepository<FieldMetadata>

	beforeEach(async () => {
		const module = await buildTestModule(InfraSchemaFieldsSyncService).compile()
		service = module.get(InfraSchemaFieldsSyncService)
		infraService = module.get(InfraService)
		schemaInfoS = module.get(SchemaInfoService)
		repo = service.repo
	})

	it("should have proper repo", () => {
		expect(repo).toEqual({ testId: "REPO_zmaj_field_metadata" })
	})

	describe("removeFieldsWithoutColumn", () => {
		let columns: DbColumn[]
		let fields: FieldMetadata[]
		beforeEach(() => {
			columns = times(5, (i) => DbColumnStub({ tableName: `tb_${i}`, columnName: `cl_${i}` }))
			fields = times(5, (i) => FieldMetadataStub({ tableName: `tb_${i}`, columnName: `cl_${i}` }))

			service["addMissingFields"] = vi.fn()
			schemaInfoS.getColumns = vi.fn().mockImplementation(async () => columns)
			infraService.getFieldMetadata = vi.fn().mockImplementation(async () => fields)
			repo.deleteWhere = vi.fn()
		})

		it("should do nothing if there are no redundant fields", async () => {
			await service.sync()
			expect(repo.deleteWhere).not.toBeCalled()
		})

		it("should delete redundant fields", async () => {
			columns.pop()
			columns.pop()
			fields = fields.map((f, i) => ({ ...f, id: String(i) }))

			await service.sync()
			expect(repo.deleteWhere).toBeCalledWith({ where: { id: { $in: ["3", "4"] } } })
		})
	})

	describe("addMissingFields", () => {
		let columns: DbColumn[]
		let fields: FieldMetadata[]
		let collections: CollectionMetadata[]
		beforeEach(() => {
			collections = times(5, (i) => CollectionMetadataStub({ tableName: `tb_${i}` }))

			columns = times(5, (i) => DbColumnStub({ tableName: `tb_${i}`, columnName: `cl_${i}` }))

			fields = times(5, (i) => FieldMetadataStub({ tableName: `tb_${i}`, columnName: `cl_${i}` }))

			service["removeFieldsWithoutColumn"] = vi.fn()
			schemaInfoS.getColumns = vi.fn().mockImplementation(async () => columns)
			infraService.getFieldMetadata = vi.fn().mockImplementation(async () => fields)
			infraService.getCollectionMetadata = vi.fn().mockImplementation(async () => collections)

			repo.createMany = vi.fn()
		})

		it("should do nothing if all columns have field", async () => {
			await service.sync()
			expect(repo.createMany).not.toBeCalled()
		})

		it("should create missing fields", async () => {
			fields.pop()
			fields.pop()
			await service.sync()
			expect(repo.createMany).toBeCalledWith({
				data: [
					expect.objectContaining({
						columnName: "cl_3",
						tableName: "tb_3",
					}),
					expect.objectContaining({
						columnName: "cl_4",
						tableName: "tb_4",
					}),
				],
			})
		})
	})

	describe("sync", () => {
		beforeEach(() => {
			service["addMissingFields"] = vi.fn()
			service["removeFieldsWithoutColumn"] = vi.fn()
		})

		it("should sync columns and fields", async () => {
			await service.sync()

			expect(service["addMissingFields"]).toBeCalled()
			expect(service["removeFieldsWithoutColumn"]).toBeCalled()
		})
	})
})
