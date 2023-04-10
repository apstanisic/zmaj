import { BootstrapRepoManager } from "@api/database/BootstrapRepoManager"
import { SchemaInfoService } from "@zmaj-js/orm"
import { buildTestModule } from "@api/testing/build-test-module"
import { InternalServerErrorException } from "@nestjs/common"
import { TestingModule } from "@nestjs/testing"
import {
	CollectionDef,
	FieldDef,
	nestByTableAndColumnName,
	systemCollections,
} from "@zmaj-js/common"
import {
	CollectionMetadataStub,
	DbColumnStub,
	FieldMetadataStub,
	ForeignKeyStub,
	RelationMetadataStub,
	allMockCollectionMetadata,
	allMockColumns,
	allMockFieldDefs,
	allMockFieldMetadata,
	allMockForeignKeys,
	allMockRelationDefs,
	allMockRelationMetadata,
	mockCollectionConsts,
	mockCollectionDefs,
	mockCollectionMetadata,
	mockCompositeUniqueKeys,
	mockFields,
	mockRelationMetadata,
} from "@zmaj-js/test-utils"
import { omit } from "radash"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraService } from "../infra.service"
import { ExpandRelationsService } from "./expand-relations.service"
import { InfraStateService } from "./infra-state.service"
import { InitialDbState } from "./InitialDbState"

const dbState: InitialDbState = structuredClone({
	columns: nestByTableAndColumnName(allMockColumns),
	fieldMetadata: allMockFieldMetadata,
	relationMetadata: allMockRelationMetadata,
	collectionMetadata: allMockCollectionMetadata,
	fks: allMockForeignKeys,
	compositeUniqueKeys: Object.values(mockCompositeUniqueKeys),
})

describe("InfraStateService", () => {
	let service: InfraStateService
	let module: TestingModule

	beforeEach(async () => {
		module = await buildTestModule(InfraStateService).compile()

		service = module.get(InfraStateService)
		service["expandRelationsService"] = new ExpandRelationsService()
		service["getDbState"] = vi.fn(async () => dbState)
	})

	/**
	 *
	 */
	describe("expandField", () => {
		const field = mockFields.posts.created_at

		it("should throw if there is not collection for this field", () => {
			const state: InitialDbState = { ...dbState, collectionMetadata: [] }
			expect(() => service["expandField"](field, state)).toThrow(InternalServerErrorException)
		})

		it("should throw if there is not column for this field", () => {
			const state: InitialDbState = { ...dbState, columns: {} }
			expect(() => service["expandField"](field, state)).toThrow(InternalServerErrorException)
		})

		it("should expand field", () => {
			const res = service["expandField"](field, dbState)
			expect(res).toEqual<FieldDef>({
				...field,
				fieldConfig: field.fieldConfig as any,
				dataType: "datetime",
				dbDefaultValue: "now()",
				hasDefaultValue: true,
				isAutoIncrement: false,
				isPrimaryKey: false,
				isForeignKey: false,
				isNullable: false,
				dbRawDataType: "timestamp with time zone",
				isUnique: false,
				fieldName: "createdAt",
				// collectionId: mockCollectionConsts.posts.id,
				collectionName: mockCollectionConsts.posts.camel,
			})
		})
	})

	describe("expandCollection", () => {
		const collection = mockCollectionMetadata.posts

		it("should return undefined if there is no pk", () => {
			const fields = allMockFieldDefs.filter(
				(f) => f.tableName === collection.tableName && !f.isPrimaryKey,
			)
			const res = service["expandCollection"](collection, fields, allMockRelationDefs)
			expect(res).toBeUndefined()
		})

		it("should expand collection", () => {
			const res = service["expandCollection"](collection, allMockFieldDefs, allMockRelationDefs)
			expect(res).toEqual<CollectionDef>({
				...collection,
				pkColumn: "id",
				pkField: "id",
				pkType: "uuid",
				collectionName: "posts",
				isJunctionTable: false,
				relations: expect.anything(),
				fields: expect.anything(),
				definedInCode: false,
				authzKey: "collections.posts",
				layoutConfig: expect.anything(),
			})
		})

		it("should set fields", () => {
			const res = service["expandCollection"](collection, allMockFieldDefs, allMockRelationDefs)!
			const amountOfFields = allMockFieldMetadata.filter((f) => f.tableName === "posts").length
			expect(Object.keys(res.fields)).toHaveLength(amountOfFields)
		})

		it("should set relations", () => {
			const amountOfRelations = allMockRelationMetadata.filter(
				(r) => r.tableName === "posts",
			).length

			const res = service["expandCollection"](collection, allMockFieldDefs, allMockRelationDefs)!
			expect(Object.keys(res.relations)).toHaveLength(amountOfRelations)
		})
	})

	/**
	 *
	 */
	describe("expandRelation", () => {
		const relation = mockRelationMetadata.comments.post
		beforeEach(async () => {
			service["expandRelationsService"].expand = vi.fn().mockReturnValue("expanded")
		})

		it("should expand infra relation", () => {
			const res = service["expandRelation"](relation, dbState)
			expect(res).toEqual("expanded")
		})

		it("should pass required params", () => {
			service["expandRelation"](relation, dbState)
			expect(service["expandRelationsService"].expand).toBeCalledWith(relation, {
				fks: dbState.fks,
				compositeUniqueKeys: dbState.compositeUniqueKeys,
				collections: [...dbState.collectionMetadata, ...systemCollections],
				fields: dbState.fieldMetadata,
				allRelations: [
					...dbState.relationMetadata,
					...systemCollections.flatMap((c) => Object.values(c.relations).map((v) => v.relation)),
				],
			})
		})
	})

	/**
	 *
	 */
	describe("getStateFromDb", () => {
		it("should get state from db and store it in the class", async () => {
			const colStub = [CollectionMetadataStub({ tableName: "col_qwerty" })]
			const fieldsStub = [FieldMetadataStub({ tableName: "field_qwerty" })]
			const relStub = [RelationMetadataStub({ tableName: "rel_qwerty" })]
			const columnsStub = [DbColumnStub({ tableName: "column_qwerty" })]
			const fksStub = [ForeignKeyStub({ fkTable: "fk_qwerty" })]
			const uniqueStub = [{ tableName: "fk_qwerty" } as any]

			const schemaInfoService = module.get(SchemaInfoService)

			schemaInfoService.getColumns = vi.fn(async () => columnsStub)
			// use infra fks because of duplicates
			// schemaInfoService.getForeignKeys = vi.fn(async () => fksStub)
			schemaInfoService.getCompositeUniqueKeys = vi.fn(async () => uniqueStub)

			const infraService = module.get(InfraService)

			infraService.getCollectionMetadata = vi.fn(async () => colStub)
			infraService.getFieldMetadata = vi.fn(async () => fieldsStub)
			infraService.getRelationMetadata = vi.fn(async () => relStub)
			// use this instead of schemaInfo.getFk
			infraService.getForeignKeys = vi.fn(async () => fksStub)

			// We are overwriting default `getDbState` in `beforeEach`
			const service = new InfraStateService(
				schemaInfoService,
				infraService,
				module.get(BootstrapRepoManager),
			)
			const res = await service["getDbState"]()

			expect(res).toEqual<InitialDbState>({
				collectionMetadata: colStub,
				columns: nestByTableAndColumnName(columnsStub),
				compositeUniqueKeys: uniqueStub,
				fieldMetadata: fieldsStub,
				fks: fksStub,
				relationMetadata: relStub,
			})
		})
	})

	/**
	 *
	 */
	describe("initializeState", () => {
		it("should expand fields", async () => {
			expect(service.fields).toHaveLength(0)
			await service.initializeState()
			const userFields = service.fields.filter((f) => !f.tableName.startsWith("zmaj"))
			expect(userFields).toHaveLength(allMockFieldMetadata.length)

			for (const field of userFields) {
				expect(field.dataType).toBeDefined()
			}
		})

		it("should expand relations", async () => {
			expect(service.relations).toHaveLength(0)
			await service.initializeState()
			const userRelations = service.relations.filter((r) => !r.tableName.startsWith("zmaj"))
			expect(userRelations).toHaveLength(allMockRelationMetadata.length)

			for (const relation of userRelations) {
				expect(relation.collectionName).toBeDefined()
			}
		})

		it("should expand collections", async () => {
			expect(service.collections).toEqual({})
			await service.initializeState()
			expect(Object.keys(service.collections)).toHaveLength(
				allMockCollectionMetadata.length + systemCollections.length,
			)

			for (const collection of Object.values(service.collections)) {
				expect(collection.authzKey).toBeDefined()
			}
		})
	})

	describe("findCollection", () => {
		// since this values are defined in code, it cannot have constant values
		const toOmit: (keyof CollectionDef)[] = ["fields", "relations", "layoutConfig"]

		beforeEach(async () => {
			await service.initializeState()
			// we need this since, we are
			// service["_collections"] = mockCollectionDefs
		})

		it("should find collection by uuid", () => {
			const col = service.getCollection(mockCollectionDefs.posts.id)
			expect(omit(col!, toOmit)).toEqual<Partial<CollectionDef>>(
				omit(mockCollectionDefs.posts, toOmit),
			)
		})

		it("should find collection by table name", () => {
			const col = service.getCollection(mockCollectionDefs.posts.tableName)
			expect(omit(col!, toOmit)).toEqual<Partial<CollectionDef>>(
				omit(mockCollectionDefs.posts, toOmit),
			)
		})

		it("should find collection if non full collection is provided", () => {
			const col = service.getCollection({ collectionName: "posts" } as any)
			expect(omit(col!, toOmit)).toEqual<Partial<CollectionDef>>(
				omit(mockCollectionDefs.posts, toOmit),
			)
		})

		it("should return undefined if not found", () => {
			const col = service.getCollection("unknown")
			expect(col).toBeUndefined()
		})
	})
})
