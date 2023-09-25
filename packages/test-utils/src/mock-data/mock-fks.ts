import { ForeignKey } from "@zmaj-js/orm"
import { ForeignKeyStub } from "../stubs/foreign-key.stub.js"
import {
	mockCollectionConsts as c,
	mockFkNames,
	mockFieldsConsts as p,
} from "./infra-mock-consts.js"

const idCol = "id"
const uuid = "uuid"

export const mockForeignKeys = {
	// comments -> posts
	[mockFkNames.comments__posts]: ForeignKeyStub({
		fkTable: c.comments.snake,
		fkColumn: p.comments.post_id.snake,
		fkName: mockFkNames.comments__posts,
		referencedColumn: idCol,
		referencedTable: c.posts.snake,
		fkColumnUnique: false,
		fkColumnDataType: uuid,
		onDelete: "CASCADE",
		onUpdate: "NO ACTION",
	}),

	// posts_tags -> posts
	[mockFkNames.posts_tags__posts]: ForeignKeyStub({
		fkTable: c.posts_tags.snake,
		fkColumn: p.posts_tags.post_id.snake,
		fkName: mockFkNames.posts_tags__posts,
		referencedColumn: idCol,
		referencedTable: c.posts.snake,
		fkColumnUnique: false,
		fkColumnDataType: uuid,
		onDelete: "CASCADE",
		onUpdate: "NO ACTION",
	}),

	// posts_tags -> tags
	[mockFkNames.posts_tags__tags]: ForeignKeyStub({
		fkTable: c.posts_tags.snake,
		fkColumn: p.posts_tags.tag_id.snake,
		fkName: mockFkNames.posts_tags__tags,
		referencedColumn: idCol,
		referencedTable: c.tags.snake,
		fkColumnUnique: false,
		fkColumnDataType: uuid,
		onDelete: "CASCADE",
		onUpdate: "NO ACTION",
	}),

	// posts_info -> posts
	[mockFkNames.posts_info__posts]: ForeignKeyStub({
		fkTable: c.posts_info.snake,
		fkColumn: p.posts_info.post_id.snake,
		fkName: mockFkNames.posts_info__posts,
		referencedColumn: idCol,
		referencedTable: c.posts.snake,
		fkColumnUnique: true,
		fkColumnDataType: uuid,
		onDelete: "CASCADE",
		onUpdate: "NO ACTION",
	}),
}
export const allMockForeignKeys: ForeignKey[] = Object.values(mockForeignKeys).map((fk) => fk)
