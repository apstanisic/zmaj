import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException } from "@nestjs/common"
import { makeWritable, RelationDef } from "@zmaj-js/common"
import {
	RelationMetadataStub,
	mockCompositeUniqueKeyId,
	mockFkNames,
	mockRelationDefs,
	mockRelationsConsts,
	RelationDefStub,
} from "@zmaj-js/test-utils"
import { Writable } from "type-fest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ManyToManyRelationsService } from "./many-to-many-relations.service"

describe("ManyToManyRelationsService", () => {
	let service: ManyToManyRelationsService
	let infraState: InfraStateService
	let alterSchema: AlterSchemaService

	beforeEach(async () => {
		const module = await buildTestModule(ManyToManyRelationsService).compile()
		service = module.get(ManyToManyRelationsService)
		infraState = module.get(InfraStateService)
		alterSchema = module.get(AlterSchemaService)
	})

	//
	describe("joinManyToMany", () => {
		let rel1: Writable<RelationDef>
		let rel2: Writable<RelationDef>
		const junction = "postsTags"
		// let ids: [UUID, UUID]
		const updateById = vi.fn()

		beforeEach(() => {
			rel1 = structuredClone(mockRelationDefs.posts_tags.post)
			rel2 = structuredClone(mockRelationDefs.posts_tags.tag)
			infraState["_relations"] = [rel1, rel2] as any

			service["alterSchema"].createUniqueKey = vi.fn()
			service["schemaInfo"].getCompositeUniqueKeys = vi.fn().mockResolvedValue([])
			service["repo"].updateById = updateById
		})

		it("should throw if invalid relations are provided", async () => {
			rel2.type = "one-to-many"
			await expect(service.joinManyToMany(junction)).rejects.toThrow(BadRequestException)
		})

		it("should throw if relations fk are not in the same table", async () => {
			rel2.collectionName = "notJunctionTable"
			// infraState["_relations"] = [rel1, rel2] as any
			await expect(service.joinManyToMany(junction)).rejects.toThrow(BadRequestException)
		})

		it("should update relations in db so we know they are m2m", async () => {
			await service.joinManyToMany(junction)
			expect(updateById).nthCalledWith(1, {
				trx: "TEST_TRX",
				changes: { mtmFkName: mockFkNames.posts_tags__tags },
				id: mockRelationsConsts.posts.tags.id,
			})

			expect(updateById).nthCalledWith(2, {
				trx: "TEST_TRX",
				changes: { mtmFkName: mockFkNames.posts_tags__posts },
				id: mockRelationsConsts.tags.posts.id,
			})
		})

		it("should create composite unique key and log migration", async () => {
			await service.joinManyToMany(junction)

			expect(service["alterSchema"].createUniqueKey).toBeCalledWith({
				tableName: "posts_tags",
				columnNames: ["post_id", "tag_id"],
				trx: "TEST_TRX",
			})
		})

		it("should not modify schema if composite unique key exist", async () => {
			service["schemaInfo"].getCompositeUniqueKeys = vi.fn(async () => [
				{
					columnNames: ["tag_id", "post_id"] as [string, string],
					tableName: "posts_tags",
					keyName: "hello",
					schemaName: "public",
				},
			])

			await service.joinManyToMany(junction)

			expect(service["schemaInfo"].getCompositeUniqueKeys).toBeCalledWith({
				table: "posts_tags",
				trx: "TEST_TRX",
			})
			expect(service["alterSchema"].createUniqueKey).not.toBeCalled()
		})
	})

	describe("splitManyToMany", () => {
		const updateWhere = vi.fn()
		let rel1 = mockRelationDefs.posts.tags
		let rel2 = mockRelationDefs.tags.posts

		beforeEach(() => {
			rel1 = structuredClone(mockRelationDefs.posts.tags)
			rel2 = structuredClone(mockRelationDefs.tags.posts)
			service["repo"].updateWhere = updateWhere
			alterSchema.dropUniqueKey = vi.fn()
		})

		it("should throw if relations are not m2m", async () => {
			makeWritable(rel1).type = "many-to-one"
			makeWritable(rel2).type = "many-to-one"
			// rel1.type = "many-to-one"
			infraState["_relations"] = [rel1, rel2]
			await expect(service.splitManyToMany("postsTags")).rejects.toThrow(BadRequestException)
		})

		it("should not throw if there is only 1 relations (other is system table)", async () => {
			infraState["_relations"] = [rel1]
			await expect(service.splitManyToMany("postsTags")).resolves.not.toThrow()
		})

		it("should change mtmFkName to null so that relations become m2o", async () => {
			await service.splitManyToMany("postsTags")
			expect(updateWhere).toBeCalledWith({
				trx: "TEST_TRX",
				where: {
					id: { $in: [rel1.id, rel2.id] },
				},
				changes: { mtmFkName: null },
			})
		})

		it("should remove composite unique key", async () => {
			await service.splitManyToMany("postsTags")
			expect(alterSchema.dropUniqueKey).toBeCalledWith({
				columnNames: ["post_id", "tag_id"],
				indexName: mockCompositeUniqueKeyId.posts_tags,
				tableName: "posts_tags",
				trx: "TEST_TRX",
			})
		})
	})

	describe("createRelation", () => {
		const dto: any = { test: 123 }

		beforeEach(() => {
			service["createMtmService"].createRelation = vi.fn().mockResolvedValue("res")
		})

		it("should call separate class for this", async () => {
			const res = await service.createRelation(dto)
			expect(service["createMtmService"].createRelation).toBeCalledWith({ test: 123 })
			expect(res).toEqual("res")
		})
	})

	describe("deleteRelation", () => {
		let relation: RelationDef
		beforeEach(() => {
			relation = RelationDefStub({
				relation: RelationMetadataStub({ fkName: "fk1", mtmFkName: "fk2" }),
				// fkName: "fk1",
				// mtmFkName: "fk2",
				type: "many-to-many",
				junction: {
					tableName: "jt",
					collectionName: "jt",
					thisSide: {
						columnName: "ljc",
						fieldName: "ljc",
					},
					otherSide: {
						columnName: "rjc",
						fieldName: "rjc",
					},
					uniqueKey: "cuq",
					collectionAuthzKey: "AUTHZ_KEY",
				},
			})
			service["alterSchema"].dropUniqueKey = vi.fn()
			service["alterSchema"].dropFk = vi.fn()
			service["repo"].deleteWhere = vi.fn()
		})

		it("should drop composite unique key", async () => {
			await service.deleteRelation(relation)

			expect(service["alterSchema"].dropUniqueKey).toBeCalledWith({
				tableName: "jt",
				columnNames: ["ljc", "rjc"],
				indexName: "cuq",
				trx: "TEST_TRX",
			})

			expect(service["alterSchema"].dropFk).nthCalledWith(1, {
				fkTable: "jt",
				fkColumn: "ljc",
				indexName: "fk1",
				trx: "TEST_TRX",
			})

			expect(service["alterSchema"].dropFk).nthCalledWith(2, {
				fkTable: "jt",
				fkColumn: "rjc",
				indexName: "fk2",
				trx: "TEST_TRX",
			})
		})

		it("should remove relations from db", async () => {
			await service.deleteRelation(relation)
			expect(service["repo"].deleteWhere).toBeCalledWith({
				trx: "TEST_TRX",
				where: { $or: [{ fkName: "fk1" }, { fkName: "fk2" }] },
			})
		})
	})
})
