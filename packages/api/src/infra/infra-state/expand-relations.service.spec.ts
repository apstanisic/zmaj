import { buildTestModule } from "@api/testing/build-test-module"
import { InternalServerErrorException } from "@nestjs/common"
import { CollectionMetadata, RelationMetadata, RelationDef } from "@zmaj-js/common"
import {
	allMockColumns,
	allMockForeignKeys,
	allMockCollectionMetadata,
	allMockRelationMetadata,
	CollectionMetadataStub,
	RelationMetadataStub,
	mockCollectionConsts as t,
	mockCompositeUniqueKeys,
	mockFkNames,
} from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it } from "vitest"
import { ExpandRelationsService } from "./expand-relations.service"

const fkNames = mockFkNames

const mockData = {
	allRelations: allMockRelationMetadata,
	fks: allMockForeignKeys,
	columns: allMockColumns,
	collections: allMockCollectionMetadata,
	compositeUniqueKeys: Object.values(mockCompositeUniqueKeys),
}

describe("ExpandRelationsService", () => {
	let service: ExpandRelationsService

	beforeEach(async () => {
		const module = await buildTestModule(ExpandRelationsService).compile()
		service = module.get(ExpandRelationsService)
		mockData.allRelations.forEach((r) => {
			r.hidden = false
		})
	})

	describe("expand", () => {
		let relation: RelationMetadata
		let collection: CollectionMetadata
		beforeEach(() => {
			relation = RelationMetadataStub()
			collection = CollectionMetadataStub({ tableName: relation.tableName })
		})
		it("should throw if relation's collection does not exist", () => {
			expect(() =>
				service.expand(relation, {
					allRelations: [],
					collections: [],
					fks: [],
					compositeUniqueKeys: [],
				}),
			).toThrow(InternalServerErrorException)
			//
		})

		it("should throw if relation's fk does not exist", () => {
			expect(() =>
				service.expand(relation, {
					allRelations: [],
					collections: [collection],
					fks: [],
					compositeUniqueKeys: [],
				}),
			).toThrow(InternalServerErrorException)
		})

		it("should generate m2o/o2m relation", () => {
			const commentsBaseRelation = mockData.allRelations.find(
				(r) => r.tableName === t.comments.snake && r.fkName === fkNames.comments__posts,
			)!

			const postsBaseRelation = mockData.allRelations.find(
				(r) => r.tableName === t.posts.snake && r.fkName === fkNames.comments__posts,
			)!

			const commentsRelation = service.expand(commentsBaseRelation, mockData)
			const postsRelation = service.expand(postsBaseRelation, mockData)

			expect(commentsRelation).toEqual({
				type: "many-to-one",
				id: commentsBaseRelation.id,
				tableName: commentsBaseRelation.tableName,
				relation: {
					tableName: commentsBaseRelation.tableName,
					createdAt: expect.any(Date),
					fkName: "comments_post_id_fkey",
					hidden: false,
					id: commentsBaseRelation.id,
					label: commentsBaseRelation.label,
					mtmFkName: null,
					propertyName: "post",
					template: null,
				},
				collectionName: "comments",
				columnName: "post_id",
				fieldName: "postId",
				otherSide: {
					tableName: "posts",
					collectionName: "posts",
					columnName: "id",
					fieldName: "id",
					propertyName: "comments",
					relationId: postsBaseRelation.id,
				},
				propertyName: "post",
			} satisfies RelationDef)
			expect(postsRelation).toEqual({
				type: "one-to-many",
				tableName: postsBaseRelation.tableName,
				id: postsBaseRelation.id,
				relation: {
					tableName: postsBaseRelation.tableName,
					createdAt: expect.any(Date) as any,
					fkName: "comments_post_id_fkey",
					hidden: false,
					id: postsBaseRelation.id,
					mtmFkName: null,
					label: postsBaseRelation.label,
					propertyName: "comments",
					template: null,
				},
				columnName: "id",
				fieldName: "id",
				collectionName: "posts",
				otherSide: {
					columnName: "post_id",
					fieldName: "postId",
					propertyName: "post",
					tableName: "comments",
					collectionName: "comments",
					relationId: commentsBaseRelation.id,
				},
				propertyName: "comments",
			} satisfies RelationDef)
		})

		it("should generate owner-o2o/ref-o2o relation", () => {
			const infoBaseRelation = mockData.allRelations.find(
				(r) => r.tableName === t.posts_info.snake && r.fkName === fkNames.posts_info__posts,
			)!

			const postsBaseRelation = mockData.allRelations.find(
				(r) => r.tableName === t.posts.snake && r.fkName === fkNames.posts_info__posts,
			)!

			const infoRelation = service.expand(infoBaseRelation, mockData)
			const postsRelation = service.expand(postsBaseRelation, mockData)

			expect(infoRelation).toEqual({
				tableName: infoBaseRelation.tableName,
				id: infoBaseRelation.id,
				relation: {
					tableName: infoBaseRelation.tableName,
					createdAt: expect.any(Date) as any,
					fkName: "posts_info_post_id_fkey",
					hidden: false,
					id: infoBaseRelation.id,
					label: infoBaseRelation.label,
					mtmFkName: null,
					template: null,
					propertyName: "post",
				},
				collectionName: "postsInfo",
				columnName: "post_id",
				fieldName: "postId",
				otherSide: {
					tableName: "posts",
					collectionName: "posts",
					columnName: "id",
					fieldName: "id",
					propertyName: "postInfo",
					relationId: postsBaseRelation.id,
				},
				propertyName: "post",
				type: "owner-one-to-one",
			} satisfies RelationDef)

			expect(postsRelation).toEqual((<RelationDef>{
				tableName: postsBaseRelation.tableName,
				id: postsBaseRelation.id,
				relation: {
					createdAt: expect.any(Date) as any,
					fkName: "posts_info_post_id_fkey",
					hidden: false,
					id: postsBaseRelation.id,
					label: postsBaseRelation.label,
					mtmFkName: null,
					template: null,
					tableName: postsBaseRelation.tableName,
					propertyName: "postInfo",
				},
				columnName: "id",
				fieldName: "id",
				collectionName: "posts",
				// rightCollectionId: t.posts_info.id,
				otherSide: {
					columnName: "post_id",
					fieldName: "postId",
					propertyName: "post",
					tableName: "posts_info",
					collectionName: "postsInfo",
					relationId: infoBaseRelation.id,
				},
				propertyName: "postInfo",
				type: "ref-one-to-one",
			}) satisfies RelationDef)
		})

		it("should generate m2m relation", () => {
			const tagsBaseRelation = mockData.allRelations.find(
				(r) => r.tableName === t.tags.snake && r.fkName === fkNames.posts_tags__tags,
			)!

			const postsBaseRelation = mockData.allRelations.find(
				(r) => r.tableName === t.posts.snake && r.fkName === fkNames.posts_tags__posts,
			)!

			const tagsRelation = service.expand(tagsBaseRelation, mockData)
			const postsRelation = service.expand(postsBaseRelation, mockData)

			expect(tagsRelation).toEqual({
				tableName: tagsBaseRelation.tableName,
				id: tagsBaseRelation.id,
				relation: {
					tableName: tagsBaseRelation.tableName,
					createdAt: expect.any(Date) as any,
					fkName: "posts_tags_tag_id_fkey",
					hidden: false,
					id: tagsBaseRelation.id,
					mtmFkName: "posts_tags_post_id_fkey",
					propertyName: "posts",
					label: tagsBaseRelation.label,
					template: null,
				},
				junction: {
					thisSide: {
						propertyName: "tag",
						columnName: "tag_id",
						fieldName: "tagId",
					},
					otherSide: {
						columnName: "post_id",
						fieldName: "postId",
						propertyName: "post",
					},

					collectionName: "postsTags",
					tableName: "posts_tags",
					collectionAuthzKey: "collections.postsTags",
					uniqueKey: mockCompositeUniqueKeys.posts_tags.keyName,
				},

				columnName: "id",
				fieldName: "id",
				collectionName: "tags",
				propertyName: "posts",
				// rightCollectionId: t.posts.id,
				otherSide: {
					columnName: "id",
					fieldName: "id",
					propertyName: "tags",
					collectionName: "posts",
					tableName: "posts",
					relationId: postsBaseRelation.id,
				},
				type: "many-to-many",
			} satisfies RelationDef)

			expect(postsRelation).toEqual({
				tableName: postsBaseRelation.tableName,
				id: postsBaseRelation.id,
				relation: {
					tableName: postsBaseRelation.tableName,
					createdAt: expect.any(Date) as any,
					fkName: "posts_tags_post_id_fkey",
					hidden: false,
					id: postsBaseRelation.id,
					propertyName: "tags",
					label: postsBaseRelation.label,
					mtmFkName: "posts_tags_tag_id_fkey",
					template: null,
				},

				junction: {
					thisSide: {
						propertyName: "post",
						columnName: "post_id",
						fieldName: "postId",
					},
					otherSide: {
						columnName: "tag_id",
						fieldName: "tagId",
						propertyName: "tag",
					},
					collectionName: "postsTags",
					tableName: "posts_tags",
					collectionAuthzKey: "collections.postsTags",
					uniqueKey: mockCompositeUniqueKeys.posts_tags.keyName,
				},

				columnName: "id",
				fieldName: "id",
				collectionName: "posts",
				propertyName: "tags",
				// rightCollectionId: t.tags.id,
				otherSide: {
					columnName: "id",
					fieldName: "id",
					propertyName: "posts",
					tableName: "tags",
					collectionName: "tags",
					relationId: tagsBaseRelation.id,
				},
				type: "many-to-many",
			} satisfies RelationDef)
		})
	})
})
