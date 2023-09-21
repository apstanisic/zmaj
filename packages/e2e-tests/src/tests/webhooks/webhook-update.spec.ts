import { expect } from "@playwright/test"
import { Webhook, WebhookCreateDto } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

const webhookName = getUniqueTitle()
const webhookNameUpdated = getUniqueTitle()

const createWebhookDto = new WebhookCreateDto({
	url: "http://localhost:5000",
	name: webhookName,
	events: [
		"create.posts",
		"create.comments",
		"update.comments",
		"delete.tags", //
	],
})

let webhook: Webhook

test.beforeAll(async ({ webhookPage: webhookPages }) => {
	await webhookPages.db.deleteByName(webhookName)
	await webhookPages.db.deleteByName(webhookNameUpdated)
	webhook = await webhookPages.db.create(createWebhookDto)
})

test.afterEach(async ({ webhookPage: webhookPages }) => {
	await webhookPages.db.deleteByName(webhookName)
	await webhookPages.db.deleteByName(webhookNameUpdated)
})

test("Update Webhook", async ({ webhookPage: webhookPages, page }) => {
	await webhookPages.goHome()
	await webhookPages.goToList()
	await webhookPages.goToShow(webhook.id)
	await webhookPages.clickEditButton(webhook.id)

	await page.getByLabel("Name").fill(webhookNameUpdated)
	await page.getByRole("switch", { name: "Enabled" }).click()
	await page.getByRole("button", { name: "Next" }).click()

	// removing
	await page.getByRole("button", { name: "Disable event create.posts" }).click()
	await page.getByRole("button", { name: "Disable event update.comments" }).click()

	//adding
	await page.getByRole("button", { name: "Enable event delete.comments" }).click()
	await page.getByRole("button", { name: "Enable event create.tags" }).click()
	await page.getByRole("button", { name: "Enable event update.tags" }).click()

	// there should be 5: start with 4, remove 2, add 3
	// there should be 5 check marks, since we react on 5 events
	await webhookPages.hasSelectedEventsAmount(5)

	await webhookPages.clickSaveButton()

	await webhookPages.hasBodyContent("Element updated")
	await webhookPages.toHaveUrl(`${webhook.id}/show`)

	const updated = await webhookPages.db.findByName(webhookNameUpdated)
	expect(updated).toMatchObject({
		id: webhook.id,
		name: webhookNameUpdated,
		enabled: true,
		events: expect.arrayContaining([
			"create.comments",
			"delete.tags",
			//
			"delete.comments",
			"create.tags",
			"update.tags",
		]),
	})
})
