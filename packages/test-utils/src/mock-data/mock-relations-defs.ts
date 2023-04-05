import { expandRelation, RelationMetadata, RelationDef } from "@zmaj-js/common"
import { mockCollectionConsts as t, mockRelationsConsts as r } from "./infra-mock-consts.js"
import { mockCompositeUniqueKeys } from "./mock-composite-unique-keys.js"
import { allMockForeignKeys } from "./mock-fks.js"
import { allMockCollectionMetadata } from "./mock-infra-collections.js"
import { allMockRelationMetadata, mockRelationMetadata } from "./mock-relations.js"
import { allMockFieldMetadata } from "./mock-field-metadata.js"

function expand(rel: RelationMetadata): RelationDef {
	return expandRelation(rel, {
		allRelations: allMockRelationMetadata,
		collections: allMockCollectionMetadata,
		fks: allMockForeignKeys,
		fields: allMockFieldMetadata,
		compositeUniqueKeys: Object.values(mockCompositeUniqueKeys),
		onError: (code: number) => {
			throw new Error(code.toString())
		},
	})
}

export const mockRelationDefs = {
	[t.posts.snake]: {
		[r.posts.comments.camel]: expand(mockRelationMetadata.posts.comments),
		[r.posts.post_info.camel]: expand(mockRelationMetadata.posts.postInfo),
		[r.posts.tags.camel]: expand(mockRelationMetadata.posts.tags),
	},
	[t.comments.snake]: {
		[r.comments.post.camel]: expand(mockRelationMetadata.comments.post),
	},
	[t.posts_info.snake]: {
		[r.posts_info.post.camel]: expand(mockRelationMetadata.posts_info.post),
	},
	[t.tags.snake]: {
		[r.tags.posts.camel]: expand(mockRelationMetadata.tags.posts),
	},
	[t.posts_tags.snake]: {
		[r.posts_tags.post.camel]: expand(mockRelationMetadata.posts_tags.post),
		[r.posts_tags.tag.camel]: expand(mockRelationMetadata.posts_tags.tag),
	},
}

export const allMockRelationDefs = Object.values(mockRelationDefs).flatMap((table) =>
	Object.values(table),
)
