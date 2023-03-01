import { FieldConfigSchema, FieldDef, getColumnType, FieldMetadata } from "@zmaj-js/common"
import { camel } from "radash"
import { FieldDefStub } from "../stubs/field-def.stub.js"
import { mockCollectionConsts as c, mockFieldsConsts as p } from "./infra-mock-consts.js"
import { mockColumns } from "./mock-columns.js"
import { mockFields as f } from "./mock-field-metadata.js"

/** simple helper that converts mock field to full field */
function expand(f: FieldMetadata): FieldDef {
	const columns = mockColumns[f.tableName as keyof typeof mockColumns]
	const column = columns[f.columnName as keyof typeof columns]

	return FieldDefStub({
		...f,
		fieldName: camel(f.columnName),
		dbRawDataType: column.dataType,
		dataType: getColumnType(column.dataType),
		isPrimaryKey: column.primaryKey,
		isAutoIncrement: column.autoIncrement,
		isNullable: column.nullable,
		isUnique: column.unique,
		dbDefaultValue: column.defaultValue,
		hasDefaultValue: column.defaultValue !== null,
		collectionName: camel(f.tableName),
		fieldConfig: FieldConfigSchema.parse(f.fieldConfig),
		// dbDefaultValue: null,
	})
}

export const mockFieldDefs = {
	[c.posts.snake]: {
		[p.posts.body.snake]: expand(f.posts.body),
		[p.posts.id.snake]: expand(f.posts.id),
		[p.posts.created_at.snake]: expand(f.posts.created_at),
		[p.posts.likes.snake]: expand(f.posts.likes),
		[p.posts.title.snake]: expand(f.posts.title),
	},
	[c.comments.snake]: {
		[p.comments.body.snake]: expand(f.comments.body),
		[p.comments.id.snake]: expand(f.comments.id),
		[p.comments.post_id.snake]: expand(f.comments.post_id),
	},
	[c.tags.snake]: {
		[p.tags.id.snake]: expand(f.tags.id),
		[p.tags.name.snake]: expand(f.tags.name),
	},
	[c.posts_info.snake]: {
		[p.posts_info.id.snake]: expand(f.posts_info.id),
		[p.posts_info.post_id.snake]: expand(f.posts_info.post_id),
		[p.posts_info.additional_info.snake]: expand(f.posts_info.additional_info),
	},
	[c.posts_tags.snake]: {
		[p.posts_tags.id.snake]: expand(f.posts_tags.id),
		[p.posts_tags.post_id.snake]: expand(f.posts_tags.post_id),
		[p.posts_tags.tag_id.snake]: expand(f.posts_tags.tag_id),
	},
} as const

export const allMockFieldDefs = Object.values(mockFieldDefs).flatMap((table) =>
	Object.values(table),
)
