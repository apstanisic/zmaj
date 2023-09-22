import { CollectionMetadata, FieldMetadata } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"

let field: FieldMetadata
let collection: CollectionMetadata

test.beforeEach(async ({ fieldPage }) => {
	const res = await fieldPage.db.createRandomCollectionAndField({ dataType: "boolean" })
	field = res.field
	collection = res.collection
})

test.afterEach(async ({ fieldPage }) => fieldPage.db.deleteCollection(collection))

test("Show Field", async ({ fieldPage }) => {
	await fieldPage.goHome()
	await fieldPage.goToCollectionsList()
	await fieldPage.goToCollectionsShow(collection)
	await fieldPage.goToFieldsTab()
	await fieldPage.goToSpecificField(field)
	await fieldPage.hasCrudContent(collection.collectionName)
	await fieldPage.hasCrudContent(`Field "${field.fieldName}"`)
	await fieldPage.hasCrudContent(field.columnName)
	await fieldPage.hasCrudContent("boolean") // data type
})
