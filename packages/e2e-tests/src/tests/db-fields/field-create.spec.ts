import { expect } from "@playwright/test"
import { CollectionMetadata } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { createIdRegex, uuidInsideRegex } from "../../utils/create-id-regex.js"

let collection: CollectionMetadata

test.beforeEach(async ({ fieldPage }) => {
	collection = await fieldPage.db.createCollection()
})

test.afterEach(async ({ fieldPage }) => fieldPage.db.deleteCollection(collection))

test("Create Field", async ({ page, fieldPage }) => {
	await fieldPage.goHome()
	await fieldPage.goToCollectionsList()
	await fieldPage.goToCollectionsShow(collection)
	await fieldPage.goToFieldsTab()
	await page.getByRole("button", { name: "Add field" }).click()

	await fieldPage.urlEndsWith(
		`zmajFieldMetadata/create?source={%22collectionName%22:%22${collection.collectionName}%22}`,
	)

	await page.getByLabel("Column Name").fill("test_field")
	await page.getByLabel("Label").fill("Test Label")

	await fieldPage.clickNextButton()
	await fieldPage.clickNextButton()
	await fieldPage.clickSaveButton()

	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajFieldMetadata/$ID/show"),
	)

	await fieldPage.hasCrudContent(collection.tableName)
	await fieldPage.hasCrudContent('Field "testField"')
	await fieldPage.hasCrudContent("test_field")
	await fieldPage.hasCrudContent("text")
	await fieldPage.hasCrudContent(uuidInsideRegex)
})
