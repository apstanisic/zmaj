import { test } from "../../setup/e2e-fixture.js"

test("Update Field", async ({ page, fieldPage, collectionItem, fieldItem }) => {
	await fieldPage.goHome()
	await fieldPage.goToCollectionsList()
	await fieldPage.goToCollectionsShow(collectionItem)
	await fieldPage.goToFieldsTab()
	await fieldPage.goToSpecificField(fieldItem)
	await fieldPage.clickFieldEditButton(fieldItem)

	await page.getByLabel("Label").fill("Updated Label")

	await fieldPage.clickNextButton()
	await fieldPage.clickNextButton()
	await fieldPage.clickSaveButton()

	await fieldPage.isOnFieldShowPage(fieldItem.id)

	await fieldPage.hasCrudContent(fieldItem.tableName)
	await fieldPage.hasCrudContent(`Field "${fieldItem.fieldName}"`)
	await fieldPage.hasCrudContent(fieldItem.columnName)
	// await fieldPage.hasCrudContent("text")
	await fieldPage.hasCrudContent("Updated Label")
})
