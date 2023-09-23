import { expect } from "@playwright/test"
import { CollectionMetadata } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getRandomTableName } from "../../setup/e2e-unique-id.js"

let collection: CollectionMetadata

test.afterEach(async ({ collectionFx }) => collectionFx.deleteCollection(collection))

test("Create Collection", async ({ page, collectionPage, collectionFx }) => {
	const tableName = getRandomTableName()
	await collectionPage.goHome()
	await collectionPage.goToList()
	await collectionPage.clickCreateRecordButton()
	await collectionPage.isOnCreatePage()

	await page.getByLabel("Table Name").fill(tableName)

	await collectionPage.clickNextButton()

	await page.getByLabel("Label").fill("E2E Posts")

	await collectionPage.clickSaveButton()

	await expect(async () => {
		const res = await collectionFx.find({ tableName })
		expect(res).toBeDefined()
		if (res) {
			collection = res
		}
	}).toPass()

	await collectionPage.isOnShowPage(collection.id)

	await expect(page.locator(".app-sidebar")).toContainText("E2E Posts")
	await collectionPage.hasCrudContent(tableName)
	await collectionPage.hasCrudContent("E2E Posts")
	await collectionPage.hasCrudContent(collection.id)
})
