import { CollectionDef } from "@zmaj-js/common"
import { camel } from "radash"
import { CollectionDefStub } from "../stubs/collection-def.stub.js"
import { mockCollectionConsts as t } from "./infra-mock-consts.js"
import { mockFieldDefs } from "./mock-field-defs.js"
import { mockRelationDefs } from "./mock-relations-defs.js"
import { mockCollectionMetadata } from "./mock-infra-collections.js"

function expand(table: keyof typeof t): CollectionDef {
	const fields = mockFieldDefs[table]

	// const createdAtFieldId = Object.values(fullFields).find((f) => f.fieldName === "createdAt")?.id
	// const updatedAtFieldId = Object.values(fullFields).find((f) => f.fieldName === "updatedAt")?.id

	return CollectionDefStub({
		...mockCollectionMetadata[table],
		pkColumn: "id",
		pkField: "id",
		pkType: fields["id"].dataType === "uuid" ? "uuid" : "auto-increment",
		collectionName: camel(mockCollectionMetadata[table].tableName),
		// readonly complicates
		fields: Object.fromEntries(Object.values(fields).map((f) => [f.fieldName, f])), //mapKeys(fields, k => camel(k)),
		// fullFields: Object.values(fullFields),
		relations: mockRelationDefs[table],
		// fullRelations: Object.values(mockRelationDefs[table]),
		authzKey: `collections.${mockCollectionMetadata[table].collectionName}`,
		layoutConfig: mockCollectionMetadata[table].layoutConfig as any,
		// createdAtFieldId,
		// updatedAtFieldId,
		// properties,
	})
}

export const mockCollectionDefs = {
	[t.posts.snake]: expand(t.posts.snake),
	[t.comments.snake]: expand(t.comments.snake),
	[t.tags.snake]: expand(t.tags.snake),
	[t.posts_info.snake]: expand(t.posts_info.snake),
	[t.posts_tags.snake]: expand(t.posts_tags.snake),
}

export const allMockCollectionDefs = Object.values(mockCollectionDefs)
