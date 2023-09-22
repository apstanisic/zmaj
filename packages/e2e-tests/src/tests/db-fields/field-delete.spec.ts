import { CollectionMetadata, FieldMetadata } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"

let collection: CollectionMetadata
let field: FieldMetadata

test.beforeEach(async ({ fieldPage }) => {
	const res = await fieldPage.db.createRandomCollectionAndField()
	collection = res.collection
	field = res.field
})

test.afterEach(async ({ fieldPage }) => fieldPage.db.deleteCollection(collection))

test("Delete Field", async ({ fieldPage }) => {
	await fieldPage.goHome()
	await fieldPage.goToCollectionsList()
	await fieldPage.goToCollectionsShow(collection)
	await fieldPage.goToFieldsTab()
	await fieldPage.goToSpecificField(field)
	await fieldPage.clickDeleteButton()
	await fieldPage.clickConfirmButton()
	await fieldPage.toHaveUrl(`zmajCollectionMetadata/${collection.id}/show`)

	await fieldPage.hasCrudContent(field.tableName)
	await fieldPage.hasCrudContent("auto-increment")
})
