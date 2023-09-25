import { test } from "../../setup/e2e-fixture.js"

test("Delete Field", async ({ fieldPage, collectionItem, fieldItem }) => {
	await fieldPage.goHome()
	await fieldPage.goToCollectionsList()
	await fieldPage.goToCollectionsShow(collectionItem)
	await fieldPage.goToFieldsTab()
	await fieldPage.goToSpecificField(fieldItem)
	await fieldPage.clickDeleteButton()
	await fieldPage.clickConfirmButton()
	await fieldPage.toHaveUrl(`zmajCollectionMetadata/${collectionItem.id}/show`)

	await fieldPage.hasCrudContent(fieldItem.tableName)
})
