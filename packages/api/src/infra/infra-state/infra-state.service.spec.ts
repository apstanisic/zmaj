import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { InfraService } from "@api/infra/infra.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { InternalServerErrorException } from "@nestjs/common"
import { CollectionDef, FieldDef, systemCollections } from "@zmaj-js/common"
import {
	allMockColumns,
	allMockForeignKeys,
	allMockCollectionMetadata,
	allMockFieldMetadata,
	allMockRelationMetadata,
	mockCollectionConsts,
	mockCollectionDefs,
	mockCompositeUniqueKeys,
	mockFields,
	mockCollectionMetadata,
	mockRelationMetadata,
} from "@zmaj-js/test-utils"
import { omit } from "radash"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ExpandRelationsService } from "./expand-relations.service"
import { InfraStateService } from "./infra-state.service"

describe("InfraStateService", () => {
	let service: InfraStateService
	let infraService: InfraService
	let schemaInfoService: SchemaInfoService

	beforeEach(async () => {
		const module = await buildTestModule(InfraStateService).compile()

		service = module.get(InfraStateService)
		//
		service["expandRelationsService"] = new ExpandRelationsService()
		//
		schemaInfoService = module.get(SchemaInfoService)
		schemaInfoService.getColumns = vi.fn(async () => allMockColumns)
		schemaInfoService.getForeignKeys = vi.fn(async () => allMockForeignKeys)
		schemaInfoService.getCompositeUniqueKeys = vi.fn(async () =>
			Object.values(mockCompositeUniqueKeys),
		)

		//
		infraService = module.get(InfraService)
		infraService.getCollectionMetadata = vi.fn(async () => allMockCollectionMetadata)
		infraService.getFieldMetadata = vi.fn(async () => allMockFieldMetadata)
		infraService.getRelationMetadata = vi.fn(async () => allMockRelationMetadata)
	})

	/**
	 *
	 */
	describe("expandField", () => {
		const field = mockFields.posts.created_at

		beforeEach(async () => {
			await service["setStateFromDb"]()
		})

		it("should throw if there is not collection for this field", () => {
			service["_dbCollections"] = []
			expect(() => service["expandField"](field)).toThrow(InternalServerErrorException)
		})

		it("should throw if there is not column for this field", () => {
			service["_columns"] = []
			expect(() => service["expandField"](field)).toThrow(InternalServerErrorException)
		})

		it("should expand field", () => {
			const res = service["expandField"](field)
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

		beforeEach(async () => {
			await service.initializeState()
		})

		it("should return undefined if there is no pk", () => {
			service["_columns"] = []
			const res = service["expandCollection"](collection)
			expect(res).toBeUndefined()
		})

		it("should expand collection", () => {
			const res = service["expandCollection"](collection)
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
			const res = service["expandCollection"](collection)!
			const amountOfFields = allMockFieldMetadata.filter((f) => f.tableName === "posts").length
			expect(Object.keys(res.fields)).toHaveLength(amountOfFields)
			//
		})

		it("should set relations", () => {
			const amountOfRelations = allMockRelationMetadata.filter(
				(r) => r.tableName === "posts",
			).length

			const res = service["expandCollection"](collection)!
			expect(Object.keys(res.relations)).toHaveLength(amountOfRelations)
		})
	})

	/**
	 *
	 */
	describe("expandRelation", () => {
		const relation = mockRelationMetadata.comments.post
		beforeEach(async () => {
			await service["setStateFromDb"]()
			service["expandRelationsService"].expand = vi.fn().mockReturnValue("expanded")
		})

		it("should expand infra relation", () => {
			const res = service["expandRelation"](relation)
			expect(res).toEqual("expanded")
		})

		it("should pass required params", () => {
			service["expandRelation"](relation)
			expect(service["expandRelationsService"].expand).toBeCalledWith(relation, {
				fks: service["_fks"],
				compositeUniqueKeys: service["_compositeUniqueKeys"],
				collections: [...allMockCollectionMetadata, ...systemCollections],
				allRelations: [
					...allMockRelationMetadata,
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
			infraService.getCollectionMetadata = vi.fn().mockResolvedValue([1])
			infraService.getFieldMetadata = vi.fn().mockResolvedValue([2])
			infraService.getRelationMetadata = vi.fn().mockResolvedValue([3])

			schemaInfoService.getColumns = vi.fn().mockResolvedValue([4])
			schemaInfoService.getForeignKeys = vi.fn().mockResolvedValue([5])
			schemaInfoService.getCompositeUniqueKeys = vi.fn().mockResolvedValue([6])

			await service["setStateFromDb"]()

			expect(service["_dbCollections"]).toEqual([1])
			expect(service["_dbFields"]).toEqual([2])
			expect(service["_dbRelations"]).toEqual([3])
			//
			expect(service["_columns"]).toEqual([4])
			expect(service["_fks"]).toEqual([5])
			expect(service["_compositeUniqueKeys"]).toEqual([6])
		})
	})

	/**
	 *
	 */
	describe("initializeState", () => {
		it("should expand fields", async () => {
			service["expandField"] = vi.fn().mockImplementation((v) => ({ ...v, collectionName: "qwe" }))

			expect(service.fields).toHaveLength(0)
			await service.initializeState()
			expect(service.fields).toHaveLength(allMockFieldMetadata.length)

			service.fields.forEach((f) => {
				expect(f.collectionName).toEqual("qwe")
			})
		})

		it("should expand relations", async () => {
			service["expandRelation"] = vi.fn((v): any => ({ ...v, fieldName: "qwe" }))

			expect(service.relations).toHaveLength(0)
			await service.initializeState()
			expect(service.relations).toHaveLength(allMockRelationMetadata.length)

			service.relations.forEach((r) => {
				expect(r.fieldName).toEqual("qwe")
			})
		})

		it("should expand collections", async () => {
			service["expandCollection"] = vi
				.fn()
				.mockImplementation((v) => ({ ...v, collectionName: "qwe" }))

			expect(service["_nonSystemCollections"]).toHaveLength(0)
			await service.initializeState()
			expect(service["_nonSystemCollections"]).toHaveLength(allMockCollectionMetadata.length)

			service["_nonSystemCollections"].forEach((f) => {
				expect(f.collectionName).toEqual("qwe")
			})
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
