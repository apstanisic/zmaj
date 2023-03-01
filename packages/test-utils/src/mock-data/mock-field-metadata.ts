import { FieldMetadata } from "@zmaj-js/common"
import { FieldMetadataStub } from "../stubs/field-metadata.stub.js"
import { mockCollectionConsts as c, mockFieldsConsts as p } from "./infra-mock-consts.js"

export const mockFields = {
	[c.posts.snake]: {
		[p.posts.id.snake]: FieldMetadataStub({
			columnName: p.posts.id.snake,
			id: p.posts.id.id,
			tableName: c.posts.snake,
			canRead: true,
		}),

		[p.posts.title.snake]: FieldMetadataStub({
			columnName: p.posts.title.snake,
			tableName: c.posts.snake,
			id: p.posts.title.id,
			canRead: true,
		}),

		[p.posts.body.snake]: FieldMetadataStub({
			columnName: p.posts.body.snake,
			tableName: c.posts.snake,
			id: p.posts.body.id,
			canRead: true,
		}),

		[p.posts.created_at.snake]: FieldMetadataStub({
			columnName: p.posts.created_at.snake,
			tableName: c.posts.snake,
			id: p.posts.created_at.id,
			canRead: true,
			isCreatedAt: true,
			canUpdate: false,
			// canCreate: false,
		}),

		[p.posts.likes.snake]: FieldMetadataStub({
			columnName: p.posts.likes.snake,
			tableName: c.posts.snake,
			id: p.posts.likes.id,
			canRead: true,
		}),
	},
	[c.comments.snake]: {
		[p.comments.id.snake]: FieldMetadataStub({
			columnName: p.comments.id.snake,
			tableName: c.comments.snake,
			id: p.comments.id.id,
			canRead: true,
		}),
		[p.comments.post_id.snake]: FieldMetadataStub({
			columnName: p.comments.post_id.snake,
			tableName: c.comments.snake,
			id: p.comments.post_id.id,
			canRead: true,
		}),
		[p.comments.body.snake]: FieldMetadataStub({
			columnName: p.comments.body.snake,
			tableName: c.comments.snake,
			id: p.comments.body.id,
			canRead: true,
		}),
	},
	[c.tags.snake]: {
		[p.tags.id.snake]: FieldMetadataStub({
			columnName: p.tags.id.snake,
			tableName: c.tags.snake,
			id: p.tags.id.id,
			canRead: true,
		}),
		[p.tags.name.snake]: FieldMetadataStub({
			columnName: p.tags.name.snake,
			tableName: c.tags.snake,
			id: p.tags.name.id,
			canRead: true,
			canUpdate: false,
		}),
	},
	[c.posts_tags.snake]: {
		[p.posts_tags.id.snake]: FieldMetadataStub({
			columnName: p.posts_tags.id.snake,
			tableName: c.posts_tags.snake,
			id: p.posts_tags.id.id,
			canRead: true,
		}),

		[p.posts_tags.post_id.snake]: FieldMetadataStub({
			columnName: p.posts_tags.post_id.snake,
			tableName: c.posts_tags.snake,
			id: p.posts_tags.post_id.id,
			canRead: true,
		}),

		[p.posts_tags.tag_id.snake]: FieldMetadataStub({
			columnName: p.posts_tags.tag_id.snake,
			tableName: c.posts_tags.snake,
			id: p.posts_tags.tag_id.id,
			canRead: true,
		}),
	},
	[c.posts_info.snake]: {
		[p.posts_info.id.snake]: FieldMetadataStub({
			columnName: p.posts_info.id.snake,
			tableName: c.posts_info.snake,
			id: p.posts_info.id.id,
			canRead: true,
		}),

		[p.posts_info.post_id.snake]: FieldMetadataStub({
			columnName: p.posts_info.post_id.snake,
			tableName: c.posts_info.snake,
			id: p.posts_info.post_id.id,
			canRead: true,
		}),

		[p.posts_info.additional_info.snake]: FieldMetadataStub({
			columnName: p.posts_info.additional_info.snake,
			tableName: c.posts_info.snake,
			id: p.posts_info.additional_info.id,
			canRead: true,
		}),
	},
} as const

export const allMockFieldMetadata: FieldMetadata[] = Object.values(mockFields) //
	.flatMap((table) => Object.values(table))
