import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"
import { createIdRegex } from "../../utils/create-id-regex.js"

test("Create Field", async ({ page, fieldPage, collectionItem }) => {
	await fieldPage.goHome()
	await fieldPage.goToCollectionsList()
	await fieldPage.goToCollectionsShow(collectionItem)
	await fieldPage.goToFieldsTab()
	await page.getByRole("button", { name: "Add field" }).click()

	await fieldPage.urlEndsWith(
		`zmajFieldMetadata/create?source={%22collectionName%22:%22${collectionItem.collectionName}%22}`,
	)

	await page.getByLabel("Column").fill("test_field")
	await page.getByLabel("Label").fill("Test Label")

	await fieldPage.clickNextButton()
	await fieldPage.clickNextButton()
	await fieldPage.clickSaveButton()

	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajFieldMetadata/$ID/show"),
	)

	await fieldPage.hasCrudContent(collectionItem.tableName)
	await fieldPage.hasCrudContent('Field "testField"')
	await fieldPage.hasCrudContent("test_field")
	await fieldPage.hasCrudContent("text")
	// await fieldPage.hasCrudContent(uuidInsideRegex)
})
