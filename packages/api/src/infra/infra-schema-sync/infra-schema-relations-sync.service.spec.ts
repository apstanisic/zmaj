import { OrmRepository } from "@zmaj-js/orm"
import { SchemaInfoService } from "@zmaj-js/orm"
import { buildTestModule } from "@api/testing/build-test-module"
import { RelationMetadata } from "@zmaj-js/common"
import {
	allMockCollectionMetadata,
	allMockFieldMetadata,
	allMockForeignKeys,
	allMockRelationMetadata,
	ForeignKeyStub,
	mockFkNames,
	RelationMetadataStub,
	mockCollectionConsts as t,
} from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { InfraService } from "../infra.service"
import { InfraSchemaRelationsSyncService } from "./infra-schema-relations-sync.service"

describe("InfraSchemaRelationsSyncService", () => {
	let service: InfraSchemaRelationsSyncService
	let infraS: InfraService
	let schemaS: SchemaInfoService
	let repo: OrmRepository<RelationMetadata>

	let state: Awaited<ReturnType<InfraSchemaRelationsSyncService["getFreshState"]>>

	beforeEach(async () => {
		const module = await buildTestModule(InfraSchemaRelationsSyncService).compile()
		service = module.get(InfraSchemaRelationsSyncService)
		infraS = module.get(InfraService)
		schemaS = module.get(SchemaInfoService)

		repo = service.repo

		state = {
			fieldMetadata: [...allMockFieldMetadata],
			collectionMetadata: [...allMockCollectionMetadata],
			relationMetadata: [...allMockRelationMetadata],
			fks: [...allMockForeignKeys],
		}

		service.getFreshState = vi.fn(async () => state)
	})

	it("should have proper repo", () => {
		expect(repo).toEqual({ testId: "REPO_zmaj_relation_metadata" })
	})

	describe("removeInvalidRelations", () => {
		beforeEach(() => {
			repo.deleteWhere = vi.fn()
		})
		it("should not do anything if everything is correct", async () => {
			await service["removeInvalidRelations"](state)
			expect(repo.deleteWhere).not.toBeCalled()
		})

		it("should remove relation if it's redundant", async () => {
			const redundant = RelationMetadataStub({
				tableName: t.posts.snake,
			})
			state.relationMetadata = [...allMockRelationMetadata, redundant]
			await service["removeInvalidRelations"](state)
			expect(repo.deleteWhere).toBeCalledWith({
				where: { id: { $in: [redundant.id] } },
			})
		})
	})

	describe("createMissingRelations", () => {
		beforeEach(() => {
			repo.createMany = vi.fn()
		})
		//
		it("should not do anything if everything is ok", async () => {
			await service["createMissingRelations"](state)
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
			state.fks = [...allMockForeignKeys, missing]
			await service["createMissingRelations"](state)
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
			state.fks = [...allMockForeignKeys, missing]
			state.relationMetadata = [
				...allMockRelationMetadata,
				RelationMetadataStub({
					fkName: "fk_name",
					tableName: t.posts.snake,
				}),
			]
			await service["createMissingRelations"](state)
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
			state.fks = [...allMockForeignKeys, missing]
			state.relationMetadata = [
				...allMockRelationMetadata,
				RelationMetadataStub({
					fkName: "fk_name",
					// collectionId: t.posts.id,
					tableName: t.posts.snake,
				}),
			]
			await service["createMissingRelations"](state)
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
			state.fks = [...allMockForeignKeys, missing]
			await service["createMissingRelations"](state)
			expect(repo.createMany).not.toBeCalled()
		})
	})

	describe("fixNamingCollisions", () => {
		beforeEach(() => {
			repo.updateById = vi.fn()
		})
		//
		it("should do nothing if all relation properties are free", async () => {
			await service["fixNamingCollisions"](state)
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
			state.relationMetadata = newRelations

			infraS.getRelationMetadata = vi.fn(async () => newRelations)

			await service["fixNamingCollisions"](state)
			expect(repo.updateById).toBeCalledWith({ id: rel.id, changes: { propertyName: "body1" } })
		})
	})

	describe("splitInvalidManyToMany", () => {
		beforeEach(() => {
			repo.updateWhere = vi.fn()
		})
		it("should not do anything if everything is ok", async () => {
			await service["splitInvalidManyToMany"](state)
			expect(repo.updateWhere).not.toBeCalled()
		})

		it("convert m2m to m2o relation if invalid", async () => {
			const rel = allMockRelationMetadata.find((r) => r.tableName === t.posts_info.snake)!
			const asMtm: RelationMetadata = { ...rel, mtmFkName: "hello" }
			state.relationMetadata = allMockRelationMetadata.filter((r) => r.id !== rel.id).concat(asMtm)

			await service["splitInvalidManyToMany"](state)
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
			const createMissing = vi.fn(async () => [])
			const splitInvalid = vi.fn(async () => [])
			const removeInvalid = vi.fn(async () => [])
			const fixNaming = vi.fn(async () => {})

			service["removeInvalidRelations"] = removeInvalid
			service["createMissingRelations"] = createMissing
			service["fixNamingCollisions"] = fixNaming
			service["splitInvalidManyToMany"] = splitInvalid

			// position this mock is called
			const getPlace = (mock: Mock): number => mock.mock.invocationCallOrder[0]!

			await service["sync"]()
			expect(getPlace(removeInvalid)).toBeLessThan(getPlace(createMissing))
			expect(getPlace(createMissing)).toBeLessThan(getPlace(splitInvalid))
			expect(getPlace(splitInvalid)).toBeLessThan(getPlace(fixNaming))

			// expect(removeInvalid).toHaveBeenCalledBefore(splitInvalid, true)
			// expect(splitInvalid).toHaveBeenCalledBefore(createMissing, true)
			// expect(createMissing).toHaveBeenCalledBefore(fixNaming, true)
		})
	})
})
