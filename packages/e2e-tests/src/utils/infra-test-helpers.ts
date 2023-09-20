import { CollectionCreateDto, FieldCreateDto, RelationCreateDto } from "@zmaj-js/common"
import { deleteTables } from "./e2e-delete-tables.js"
import { getSdk } from "./e2e-get-sdk.js"

export async function deleteTestCollections(): Promise<void> {
	await deleteTables("posts_tags_plw", "comments_plw", "posts_plw", "tags_plw")
}

export async function createTestCollections(): Promise<void> {
	const sdk = getSdk()
	// posts
	await sdk.infra.collections.createOne({
		data: new CollectionCreateDto({
			tableName: "posts_plw",
			label: "TestPosts",
			displayTemplate: "{title}",
			collectionName: "postsPlw",
		}),
	})

	await sdk.infra.fields.createOne({
		data: new FieldCreateDto({
			collectionName: "postsPlw",
			columnName: "title",
			dataType: "text",
		}),
	})
	await sdk.infra.fields.createOne({
		data: new FieldCreateDto({
			collectionName: "postsPlw",
			columnName: "body",
			dataType: "text",
			componentName: "long-text",
		}),
	})
	await sdk.infra.fields.createOne({
		data: new FieldCreateDto({
			collectionName: "postsPlw",
			columnName: "likes",
			dataType: "int",
		}),
	})

	// comments
	await sdk.infra.collections.createOne({
		data: new CollectionCreateDto({
			tableName: "comments_plw",
			label: "TestComments",
			collectionName: "commentsPlw",
		}),
	})

	await sdk.infra.fields.createOne({
		data: new FieldCreateDto({
			collectionName: "commentsPlw",
			columnName: "body",
			dataType: "text",
			componentName: "long-text",
		}),
	})

	// tags
	await sdk.infra.collections.createOne({
		data: new CollectionCreateDto({
			tableName: "tags_plw",
			label: "TestTags",
			collectionName: "tagsPlw",
		}),
	})

	await sdk.infra.fields.createOne({
		data: new FieldCreateDto({
			collectionName: "tagsPlw",
			columnName: "name",
			dataType: "text",
		}),
	})

	await sdk.infra.relations.createOne({
		data: new RelationCreateDto({
			type: "many-to-one",
			leftCollection: "commentsPlw",
			rightCollection: "postsPlw",
			left: {
				column: "post_id",
				propertyName: "post",
			},
			right: {
				column: "id",
				propertyName: "comments",
			},
		}),
	})

	await sdk.infra.relations.createOne({
		data: new RelationCreateDto({
			type: "many-to-many",
			leftCollection: "posts_plw",
			left: {
				column: "id",
				propertyName: "tags",
			},
			right: {
				column: "id",
				propertyName: "posts",
			},
			rightCollection: "tags_plw",
			junction: {
				tableName: "posts_tags_plw",
			},
		}),
	})
}
