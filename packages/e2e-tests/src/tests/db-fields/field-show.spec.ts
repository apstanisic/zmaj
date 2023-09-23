import { test } from "../../setup/e2e-fixture.js"

test("Show Field", async ({ fieldPage, collectionItem, fieldItem }) => {
	await fieldPage.goHome()
	await fieldPage.goToCollectionsList()
	await fieldPage.goToCollectionsShow(collectionItem)
	await fieldPage.goToFieldsTab()
	await fieldPage.goToSpecificField(fieldItem)
	await fieldPage.hasCrudContent(collectionItem.collectionName)
	await fieldPage.hasCrudContent(`Field "${fieldItem.fieldName}"`)
	await fieldPage.hasCrudContent(fieldItem.columnName)
})
