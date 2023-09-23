import { test } from "../../setup/e2e-fixture.js"

test("Show Webhook", async ({ webhookPage, webhookItem }) => {
	await webhookPage.goHome()
	await webhookPage.goToList()
	await webhookPage.goToShow(webhookItem.id)
	await webhookPage.hasCrudContent(webhookItem.name)
	await webhookPage.hasCrudContent(webhookItem.url)
	await webhookPage.goToEventsTab()
	await webhookPage.hasSelectedEventsAmount(webhookItem.events.length)
})
