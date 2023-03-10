import {
	CollectionMetadata,
	CollectionCreateDto,
	FieldCreateDto,
	RelationCreateDto,
} from "@zmaj-js/common"
import { testSdk } from "./test-sdk.js"

export async function deleteCollection(tableName: string): Promise<CollectionMetadata | undefined> {
	const allCollections = await testSdk.infra.getCollections()

	const collection = allCollections.find((c) => c.tableName === tableName)
	if (!collection) return

	return testSdk.infra.collections.deleteById({ id: collection.id }).catch((e) => {
		console.log("Problem deleting collection: " + tableName, collection.id)
		throw e
	})
}

export async function deleteTestCollections(): Promise<void> {
	await deleteCollection("posts_tags_plw")
	await deleteCollection("comments_plw")
	await deleteCollection("posts_plw")
	await deleteCollection("tags_plw")
}

export async function createTestCollections(): Promise<void> {
	// posts
	await testSdk.infra.collections.createOne({
		data: new CollectionCreateDto({
			tableName: "posts_plw",
			label: "TestPosts",
			displayTemplate: "{title}",
		}),
	})

	await testSdk.infra.fields.createOne({
		data: new FieldCreateDto({
			tableName: "posts_plw",
			columnName: "title",
			dataType: "short-text",
		}),
	})
	await testSdk.infra.fields.createOne({
		data: new FieldCreateDto({
			tableName: "posts_plw",
			columnName: "body",
			dataType: "long-text",
		}),
	})
	await testSdk.infra.fields.createOne({
		data: new FieldCreateDto({
			tableName: "posts_plw",
			columnName: "likes",
			dataType: "int",
		}),
	})

	// comments
	await testSdk.infra.collections.createOne({
		data: new CollectionCreateDto({
			tableName: "comments_plw",
			label: "TestComments",
		}),
	})

	await testSdk.infra.fields.createOne({
		data: new FieldCreateDto({
			tableName: "comments_plw",
			columnName: "body",
			dataType: "long-text",
		}),
	})

	// tags
	await testSdk.infra.collections.createOne({
		data: new CollectionCreateDto({
			tableName: "tags_plw",
			label: "TestTags",
		}),
	})

	await testSdk.infra.fields.createOne({
		data: new FieldCreateDto({
			tableName: "tags_plw",
			columnName: "name",
			dataType: "short-text",
		}),
	})

	await testSdk.infra.relations.createOne({
		data: new RelationCreateDto({
			type: "many-to-one",
			leftTable: "comments_plw",
			leftColumn: "post_id",
			leftPropertyName: "post",
			rightTable: "posts_plw",
			rightColumn: "id",
			rightPropertyName: "comments",
		}),
	})

	await testSdk.infra.relations.createOne({
		data: new RelationCreateDto({
			type: "many-to-many",
			leftTable: "posts_plw",
			leftColumn: "id",
			leftPropertyName: "tags",
			rightTable: "tags_plw",
			rightColumn: "id",
			rightPropertyName: "posts",
			junctionTable: "posts_tags_plw",
		}),
	})
}
