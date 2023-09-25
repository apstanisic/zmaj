import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"

test("Update Collection", async ({ page, collectionPage, collectionItem }) => {
	await collectionPage.goHome()
	await collectionPage.goToList()
	await collectionPage.goToCollectionShow(collectionItem)
	await collectionPage.clickEditButton()

	await page.getByLabel("Label").fill("UpdatedTestTable")

	await collectionPage.clickSaveButton()
	await collectionPage.isOnShowPage(collectionItem.id)

	await collectionPage.hasCrudContent(collectionItem.tableName)
	// await collectionPage.hasCrudContent("This is updated description")
	await collectionPage.hasCrudContent("UpdatedTestTable")
	// sidebar
	await expect(page.locator(".app-sidebar")).toContainText("UpdatedTestTable")
})
