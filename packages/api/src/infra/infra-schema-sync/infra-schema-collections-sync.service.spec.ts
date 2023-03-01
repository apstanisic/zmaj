import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { InfraService } from "@api/infra/infra.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { CollectionMetadata } from "@zmaj-js/common"
import {
	allMockCollectionMetadata,
	CollectionMetadataStub,
	mockCollectionConsts,
} from "@zmaj-js/test-utils"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraSchemaCollectionsSyncService } from "./infra-schema-collections-sync.service"

describe("InfraSchemaCollectionsSyncService ", () => {
	let service: InfraSchemaCollectionsSyncService
	let infraS: InfraService
	let schemaS: SchemaInfoService
	let repo: OrmRepository<CollectionMetadata>

	beforeEach(async () => {
		const module = await buildTestModule(InfraSchemaCollectionsSyncService).compile()
		service = module.get(InfraSchemaCollectionsSyncService)

		infraS = module.get(InfraService)
		schemaS = module.get(SchemaInfoService)
		repo = service.repo

		infraS.getCollectionMetadata = vi.fn(async () => allMockCollectionMetadata)
		schemaS.getTableNames = vi.fn(async () => Object.keys(mockCollectionConsts))
	})

	it("should have proper repo", () => {
		expect(repo).toEqual({ testId: "REPO_zmaj_collection_metadata" })
	})

	describe("sync", () => {
		it("should sync schema and infra", async () => {
			const remove = vi.fn()
			const add = vi.fn()
			service["removeRedundantCollections"] = remove
			service["addMissingCollections"] = add
			await service.sync()
			expect(remove).toBeCalled()
			expect(add).toBeCalled()
		})
	})

	describe("removeRedundantCollections", () => {
		const id = v4()
		beforeEach(() => {
			infraS.getCollectionMetadata = vi
				.fn()
				.mockResolvedValue([CollectionMetadataStub({ tableName: "tbl", id })])
			schemaS.getTableNames = vi.fn().mockResolvedValue(["tbl"])
			service["addMissingCollections"] = vi.fn()
			repo.deleteWhere = vi.fn()
		})

		it("should do nothing if there are not redundant", async () => {
			await service.sync()
			expect(repo.deleteWhere).not.toBeCalled()
		})

		it("should delete redundant collections", async () => {
			schemaS.getTableNames = vi.fn().mockResolvedValue([])
			await service.sync()
			expect(repo.deleteWhere).toBeCalledWith({ where: { id: { $in: [id] } } })
		})
	})

	describe("addMissingCollections", () => {
		const id = v4()
		beforeEach(() => {
			infraS.getCollectionMetadata = vi
				.fn()
				.mockResolvedValue([CollectionMetadataStub({ tableName: "tbl", id })])
			schemaS.getTableNames = vi.fn().mockResolvedValue(["tbl", "tbl_2", "zmaj_users"])
			service["removeRedundantCollections"] = vi.fn()
			repo.createMany = vi.fn()
		})
		//
		it("should add missing collections", async () => {
			await service.sync()
			expect(repo.createMany).toBeCalledWith({
				data: [expect.objectContaining({ tableName: "tbl_2" })],
			})
		})

		it("should ignore system tables", async () => {
			schemaS.getTableNames = vi.fn().mockResolvedValue(["tbl", "zmaj_users"])
			await service.sync()
			expect(repo.createMany).not.toBeCalled()
			//
		})
	})
})
