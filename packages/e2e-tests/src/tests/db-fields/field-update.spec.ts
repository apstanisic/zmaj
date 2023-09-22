import { CollectionMetadata, FieldMetadata } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"

let collection: CollectionMetadata
let field: FieldMetadata

test.beforeEach(async ({ fieldPage }) => {
	const res = await fieldPage.db.createRandomCollectionAndField({
		dataType: "text",
		isNullable: true,
		isUnique: false,
		dbDefaultValue: null,
	})
	collection = res.collection
	field = res.field
})

test.afterEach(async ({ fieldPage }) => fieldPage.db.deleteCollection(collection))

test("Update Field", async ({ page, fieldPage }) => {
	await fieldPage.goHome()
	await fieldPage.goToCollectionsList()
	await fieldPage.goToCollectionsShow(collection)
	await fieldPage.goToFieldsTab()
	await fieldPage.goToSpecificField(field)
	await fieldPage.clickFieldEditButton(field)

	await page.getByLabel("Label").fill("Updated Label")

	await fieldPage.clickNextButton()
	await fieldPage.clickNextButton()
	await fieldPage.clickSaveButton()

	await fieldPage.isOnFieldShowPage(field.id)

	await fieldPage.hasCrudContent(field.tableName)
	await fieldPage.hasCrudContent(`Field "${field.fieldName}"`)
	await fieldPage.hasCrudContent(field.columnName)
	await fieldPage.hasCrudContent("text")
	await fieldPage.hasCrudContent("Updated Label")
})
