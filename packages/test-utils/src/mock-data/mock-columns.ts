import { DbColumn } from "@zmaj-js/common"
import { DbColumnStub } from "../stubs/db-column.stub.js"
import { mockCollectionConsts as c, mockFieldsConsts as f } from "./infra-mock-consts.js"

export const mockColumns = {
	[c.posts.snake]: {
		[f.posts.id.snake]: DbColumnStub({
			unique: true,
			primaryKey: true,
			columnName: f.posts.id.snake,
			tableName: c.posts.snake,
			autoIncrement: false,
			dataType: "uuid",
			nullable: false,
			defaultValue: null,
		}),

		[f.posts.title.snake]: DbColumnStub({
			unique: false,
			primaryKey: false,
			columnName: f.posts.title.snake,
			tableName: c.posts.snake,
			autoIncrement: false,
			dataType: "character varying",
			nullable: false,
			defaultValue: null,
		}),

		[f.posts.body.snake]: DbColumnStub({
			unique: false,
			primaryKey: false,
			columnName: f.posts.body.snake,
			tableName: c.posts.snake,
			autoIncrement: false,
			dataType: "text",
			nullable: false,
			defaultValue: null,
		}),

		[f.posts.created_at.snake]: DbColumnStub({
			unique: false,
			primaryKey: false,
			columnName: f.posts.created_at.snake,
			tableName: c.posts.snake,
			autoIncrement: false,
			dataType: "timestamp with time zone",
			nullable: false,
			defaultValue: "now()",
		}),

		[f.posts.likes.snake]: DbColumnStub({
			unique: false,
			primaryKey: false,
			columnName: f.posts.likes.snake,
			tableName: c.posts.snake,
			autoIncrement: false,
			dataType: "integer",
			nullable: false,
			defaultValue: null,
		}),
	},
	[c.comments.snake]: {
		[f.comments.id.snake]: DbColumnStub({
			unique: true,
			primaryKey: true,
			columnName: f.comments.id.snake,
			tableName: c.comments.snake,
			autoIncrement: false,
			dataType: "uuid",
			nullable: false,
		}),
		[f.comments.post_id.snake]: DbColumnStub({
			unique: false,
			primaryKey: false,
			columnName: f.comments.post_id.snake,
			tableName: c.comments.snake,
			autoIncrement: false,
			dataType: "uuid",
			nullable: false,
		}),
		[f.comments.body.snake]: DbColumnStub({
			unique: false,
			primaryKey: false,
			columnName: f.comments.body.snake,
			tableName: c.comments.snake,
			autoIncrement: false,
			dataType: "text",
			nullable: false,
		}),
	},
	[c.tags.snake]: {
		[f.tags.id.snake]: DbColumnStub({
			unique: true,
			primaryKey: true,
			columnName: f.tags.id.snake,
			tableName: c.tags.snake,
			autoIncrement: false,
			dataType: "uuid",
			nullable: false,
		}),
		[f.tags.name.snake]: DbColumnStub({
			unique: true,
			primaryKey: false,
			tableName: c.tags.snake,
			columnName: f.tags.name.snake,
			autoIncrement: false,
			dataType: "character varying",
			nullable: false,
		}),
	},
	[c.posts_tags.snake]: {
		[f.posts_tags.id.snake]: DbColumnStub({
			unique: true,
			primaryKey: true,
			columnName: f.posts_tags.id.snake,
			tableName: c.posts_tags.snake,
			autoIncrement: true,
			dataType: "integer",
			nullable: false,
			defaultValue: null,
		}),

		[f.posts_tags.post_id.snake]: DbColumnStub({
			unique: false,
			primaryKey: false,
			columnName: f.posts_tags.post_id.snake,
			tableName: c.posts_tags.snake,
			autoIncrement: false,
			dataType: "uuid",
			nullable: false,
			defaultValue: null,
		}),

		[f.posts_tags.tag_id.snake]: DbColumnStub({
			unique: false,
			primaryKey: false,
			tableName: c.posts_tags.snake,
			columnName: f.posts_tags.tag_id.snake,
			autoIncrement: false,
			dataType: "uuid",
			nullable: false,
			defaultValue: null,
		}),
	},
	[c.posts_info.snake]: {
		[f.posts_info.id.snake]: DbColumnStub({
			unique: true,
			primaryKey: true,
			columnName: f.posts_info.id.snake,
			tableName: c.posts_info.snake,
			autoIncrement: false,
			dataType: "uuid",
			nullable: false,
		}),

		[f.posts_info.post_id.snake]: DbColumnStub({
			unique: false,
			primaryKey: false,
			columnName: f.posts_info.post_id.snake,
			tableName: c.posts_info.snake,
			autoIncrement: false,
			dataType: "uuid",
			nullable: false,
		}),

		[f.posts_info.additional_info.snake]: DbColumnStub({
			unique: false,
			primaryKey: false,
			columnName: f.posts_info.additional_info.snake,
			tableName: c.posts_info.snake,
			autoIncrement: false,
			dataType: "jsonb",
			nullable: false,
		}),
	},
} as const

export const allMockColumns: DbColumn[] = Object.values(mockColumns) //
	.flatMap((table) => Object.values(table))
