import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { asMock, RelationMetadata } from "@zmaj-js/common"
import {
	allMockForeignKeys,
	allMockCollectionMetadata,
	allMockFieldMetadata,
	allMockRelationMetadata,
	ForeignKeyStub,
	RelationMetadataStub,
	mockCollectionConsts as t,
	mockFkNames,
} from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, SpyInstance, vi } from "vitest"
import { InfraService } from "../infra.service"
import { InfraSchemaRelationsSyncService } from "./infra-schema-relations-sync.service"

describe("InfraSchemaRelationsSyncService", () => {
	let service: InfraSchemaRelationsSyncService
	let infraS: InfraService
	let schemaS: SchemaInfoService
	let repo: OrmRepository<RelationMetadata>

	let onChangeSpy: SpyInstance

	beforeEach(async () => {
		const module = await buildTestModule(InfraSchemaRelationsSyncService).compile()
		service = module.get(InfraSchemaRelationsSyncService)
		infraS = module.get(InfraService)
		schemaS = module.get(SchemaInfoService)

		repo = service.repo

		onChangeSpy = vi.spyOn(service, "onChange").mockResolvedValue(undefined)

		infraS.getFieldMetadata = vi.fn(async () => allMockFieldMetadata)
		infraS.getCollectionMetadata = vi.fn(async () => allMockCollectionMetadata)
		infraS.getRelationMetadata = vi.fn(async () => allMockRelationMetadata)
		schemaS.getForeignKeys = vi.fn(async () => allMockForeignKeys)

		await service.getFreshState()
	})

	it("should have proper repo", () => {
		expect(repo).toEqual({ testId: "REPO_zmaj_relation_metadata" })
	})

	describe("removeInvalidRelations", () => {
		beforeEach(() => {
			repo.deleteWhere = vi.fn()
		})
		it("should not do anything if everything is correct", async () => {
			await service["removeInvalidRelations"]()
			expect(repo.deleteWhere).not.toBeCalled()
		})

		it("should remove relation if it's redundant", async () => {
			const redundant = RelationMetadataStub({
				tableName: t.posts.snake,
			})
			service["relations"] = [...allMockRelationMetadata, redundant]
			await service["removeInvalidRelations"]()
			expect(repo.deleteWhere).toBeCalledWith({
				where: { id: { $in: [redundant.id] } },
			})
		})

		it("should refresh relations if there was a change", async () => {
			const redundant = RelationMetadataStub({
				tableName: t.posts.snake,
			})
			service["relations"] = [...allMockRelationMetadata, redundant]
			await service["removeInvalidRelations"]()
			expect(onChangeSpy).toBeCalled()
		})
	})

	describe("createMissingRelations", () => {
		beforeEach(() => {
			repo.createMany = vi.fn()
		})
		//
		it("should not do anything if everything is ok", async () => {
			await service["createMissingRelations"]()
			expect(repo.createMany).not.toBeCalled()
		})

		it("should create missing relations", async () => {
			const missing = ForeignKeyStub({
				fkTable: "posts",
				fkColumn: "body",
				referencedColumn: "id",
				referencedTable: "posts_info",
				fkName: "fk_name",
			})
			service["fks"] = [...allMockForeignKeys, missing]
			await service["createMissingRelations"]()
			expect(repo.createMany).toBeCalledWith({
				data: [
					expect.objectContaining({
						tableName: t.posts.snake,
						fkName: "fk_name",
						hidden: false,
						label: "Posts Info",
						mtmFkName: null,
						propertyName: "postsInfo",
						template: null,
					}),
					expect.objectContaining({
						tableName: t.posts_info.snake,
						fkName: "fk_name",
						hidden: false,
						label: "Posts",
						mtmFkName: null,
						propertyName: "posts",
						template: null,
					}),
					//
				],
			})
		})

		it("should create only missing side", async () => {
			const missing = ForeignKeyStub({
				fkTable: "posts",
				fkColumn: "body",
				referencedColumn: "id",
				referencedTable: "posts_info",
				fkName: "fk_name",
			})
			service["fks"] = [...allMockForeignKeys, missing]
			service["relations"] = [
				...allMockRelationMetadata,
				RelationMetadataStub({
					fkName: "fk_name",
					tableName: t.posts.snake,
				}),
			]
			await service["createMissingRelations"]()
			expect(repo.createMany).toBeCalledWith({
				data: [
					expect.objectContaining({
						tableName: t.posts_info.snake,
						fkName: "fk_name",
						hidden: false,
						label: "Posts",
						mtmFkName: null,
						propertyName: "posts",
						template: null,
					}),
				],
			})
		})
		it("should create only if pk table is not system", async () => {
			const missing = ForeignKeyStub({
				fkTable: "posts",
				fkColumn: "body",
				referencedColumn: "id",
				referencedTable: "zmaj_test",
				fkName: "fk_name",
			})
			service["fks"] = [...allMockForeignKeys, missing]
			service["relations"] = [
				...allMockRelationMetadata,
				RelationMetadataStub({
					fkName: "fk_name",
					// collectionId: t.posts.id,
					tableName: t.posts.snake,
				}),
			]
			await service["createMissingRelations"]()
			expect(repo.createMany).not.toBeCalled()
		})

		it("should do nothing if fk is in system table", async () => {
			const missing = ForeignKeyStub({
				fkTable: "zmaj_test",
				fkColumn: "body",
				referencedColumn: "id",
				referencedTable: "post_info",
				fkName: "fk_name",
			})
			service["fks"] = [...allMockForeignKeys, missing]
			await service["createMissingRelations"]()
			expect(repo.createMany).not.toBeCalled()
		})
	})

	describe("fixNamingCollisions", () => {
		beforeEach(() => {
			repo.updateById = vi.fn()
		})
		//
		it("should do nothing if all relation properties are free", async () => {
			await service["fixNamingCollisions"]()
			expect(repo.updateById).not.toBeCalled()
		})

		it("should get free property name if relations has collision with field", async () => {
			const rel = allMockRelationMetadata.find(
				(r) => r.tableName === t.posts.snake && r.fkName === mockFkNames.posts_info__posts,
			)!

			const withCollision: RelationMetadata = { ...rel, propertyName: "body" }
			const newRelations = allMockRelationMetadata
				.filter((r) => r.id !== rel.id)
				.concat(withCollision)
			service["relations"] = newRelations

			infraS.getRelationMetadata = vi.fn().mockResolvedValue(newRelations)

			await service["fixNamingCollisions"]()
			expect(repo.updateById).toBeCalledWith({ id: rel.id, changes: { propertyName: "body_1" } })
		})
	})

	describe("splitInvalidManyToMany", () => {
		beforeEach(() => {
			repo.updateWhere = vi.fn()
		})
		it("should not do anything if everything is ok", async () => {
			await service["splitInvalidManyToMany"]()
			expect(repo.updateWhere).not.toBeCalled()
		})

		it("convert m2m to m2o relation if invalid", async () => {
			const rel = allMockRelationMetadata.find((r) => r.tableName === t.posts_info.snake)!
			const asMtm: RelationMetadata = { ...rel, mtmFkName: "hello" }
			service["relations"] = allMockRelationMetadata.filter((r) => r.id !== rel.id).concat(asMtm)

			await service["splitInvalidManyToMany"]()
			expect(repo.updateWhere).toBeCalledWith({
				where: { id: { $in: [rel.id] } },
				changes: { mtmFkName: null },
			})
		})
	})

	describe("sync", () => {
		beforeEach(() => {
			infraS.getCollectionMetadata = vi.fn()
			infraS.getFieldMetadata = vi.fn()
			infraS.getRelationMetadata = vi.fn()
			schemaS.getForeignKeys = vi.fn()
		})
		it("should sync in correct order", async () => {
			const createMissing = vi.fn()
			const fixNaming = vi.fn()
			const splitInvalid = vi.fn()
			const removeInvalid = vi.fn()

			service["createMissingRelations"] = createMissing
			service["removeInvalidRelations"] = removeInvalid
			service["fixNamingCollisions"] = fixNaming
			service["splitInvalidManyToMany"] = splitInvalid

			await service["sync"]()
			expect(asMock(removeInvalid).mock.invocationCallOrder[0]!).toBeLessThan(
				asMock(splitInvalid).mock.invocationCallOrder[0]!,
			)
			expect(asMock(splitInvalid).mock.invocationCallOrder[0]!).toBeLessThan(
				asMock(createMissing).mock.invocationCallOrder[0]!,
			)
			expect(asMock(createMissing).mock.invocationCallOrder[0]!).toBeLessThan(
				asMock(fixNaming).mock.invocationCallOrder[0]!,
			)

			// expect(removeInvalid).toHaveBeenCalledBefore(splitInvalid, true)
			// expect(splitInvalid).toHaveBeenCalledBefore(createMissing, true)
			// expect(createMissing).toHaveBeenCalledBefore(fixNaming, true)
		})
	})
})
