import { RelationMetadataStub } from "../stubs/relation-metadata.js"
import {
	mockCollectionConsts as t,
	mockFkNames as fkNames,
	mockRelationsConsts as r,
} from "./infra-mock-consts.js"

export const mockRelationMetadata = {
	[t.posts.snake]: {
		[r.posts.comments.camel]: RelationMetadataStub({
			id: r.posts.comments.id,
			// collectionId: t.posts.id,
			fkName: fkNames.comments__posts,
			propertyName: r.posts.comments.camel,
			tableName: t.posts.snake,
			mtmFkName: null,
		}),
		[r.posts.post_info.camel]: RelationMetadataStub({
			id: r.posts.post_info.id,
			// collectionId: t.posts.id,
			fkName: fkNames.posts_info__posts,
			propertyName: r.posts.post_info.camel,
			tableName: t.posts.snake,
			mtmFkName: null,
		}),
		[r.posts.tags.camel]: RelationMetadataStub({
			id: r.posts.tags.id,
			// collectionId: t.posts.id,
			fkName: fkNames.posts_tags__posts,
			propertyName: r.posts.tags.camel,
			tableName: t.posts.snake,
			mtmFkName: fkNames.posts_tags__tags,
		}),
	},
	[t.comments.snake]: {
		[r.comments.post.camel]: RelationMetadataStub({
			id: r.comments.post.id,
			// collectionId: t.comments.id,
			fkName: fkNames.comments__posts,
			propertyName: r.comments.post.camel,
			tableName: t.comments.snake,
			mtmFkName: null,
		}),
	},
	[t.posts_info.snake]: {
		[r.posts_info.post.camel]: RelationMetadataStub({
			id: r.posts_info.post.id,
			// collectionId: t.posts_info.id,
			fkName: fkNames.posts_info__posts,
			propertyName: r.posts_info.post.camel,
			tableName: t.posts_info.snake,
			mtmFkName: null,
		}),
	},
	[t.tags.snake]: {
		[r.tags.posts.camel]: RelationMetadataStub({
			id: r.tags.posts.id,
			// collectionId: t.tags.id,
			fkName: fkNames.posts_tags__tags,
			propertyName: r.tags.posts.camel,
			tableName: t.tags.snake,
			mtmFkName: fkNames.posts_tags__posts,
		}),
	},
	[t.posts_tags.snake]: {
		[r.posts_tags.post.camel]: RelationMetadataStub({
			id: r.posts_tags.post.id,
			// collectionId: t.posts_tags.id,
			fkName: fkNames.posts_tags__posts,
			propertyName: r.posts_tags.post.camel,
			tableName: t.posts_tags.snake,
			mtmFkName: null,
			label: "Post",
		}),

		[r.posts_tags.tag.camel]: RelationMetadataStub({
			id: r.posts_tags.tag.id,
			// collectionId: t.posts_tags.id,
			fkName: fkNames.posts_tags__tags,
			propertyName: r.posts_tags.tag.camel,
			tableName: t.posts_tags.snake,
			mtmFkName: null,
			label: "Tag",
		}),
	},
}

export const allMockRelationMetadata = Object.values(mockRelationMetadata).flatMap((table) =>
	Object.values(table),
)
