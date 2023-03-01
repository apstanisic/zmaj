import { CollectionMetadata } from "@zmaj-js/common"
import { CollectionMetadataStub } from "../stubs/collection-metadata.stub.js"
import { mockCollectionConsts as t } from "./infra-mock-consts.js"

export const mockCollectionMetadata = {
	[t.posts.snake]: CollectionMetadataStub({
		id: t.posts.id,
		tableName: t.posts.snake, //
		disabled: false,
		// createdAtFieldId: f.posts.created_at.id,
	}), //
	[t.comments.snake]: CollectionMetadataStub({
		id: t.comments.id,
		tableName: t.comments.snake,
		disabled: false,
	}), //
	[t.tags.snake]: CollectionMetadataStub({
		id: t.tags.id,
		tableName: t.tags.snake, //
		disabled: false,
	}), //
	[t.posts_info.snake]: CollectionMetadataStub({
		id: t.posts_info.id,
		tableName: t.posts_info.snake,
		disabled: false,
	}), //
	[t.posts_tags.snake]: CollectionMetadataStub({
		id: t.posts_tags.id,
		tableName: t.posts_tags.snake,
		disabled: false,
	}), //
}

export const allMockCollectionMetadata: CollectionMetadata[] = Object.values(mockCollectionMetadata)
