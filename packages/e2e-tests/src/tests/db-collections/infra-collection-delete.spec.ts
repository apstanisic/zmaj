import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"

test("Delete Collection", async ({ collectionItem, collectionPage, collectionFx }) => {
	await collectionPage.goHome()
	await collectionPage.goToList()
	await collectionPage.goToCollectionShow(collectionItem)
	await collectionPage.clickDeleteButton()
	await collectionPage.clickConfirmButton()
	await collectionPage.isOnListPage()

	await expect(async () => {
		const col = await collectionFx.find({ id: collectionItem.id })
		expect(col).toBeUndefined()
	}).toPass()
})
