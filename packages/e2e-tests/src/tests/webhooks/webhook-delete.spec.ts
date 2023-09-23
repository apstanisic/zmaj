import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"

test("Delete Webhook", async ({ webhookPage, webhookItem, webhookFx }) => {
	await webhookPage.goHome()
	await webhookPage.goToList()
	await webhookPage.goToShow(webhookItem.id)

	await webhookPage.clickDeleteButton()
	await webhookPage.clickConfirmButton()

	await webhookPage.hasBodyContent("Element deleted")
	await webhookPage.isOnRootPage()

	const webhookInDb = await webhookFx.findWhere({ id: webhookItem.id })
	expect(webhookInDb).toBeUndefined()
})
