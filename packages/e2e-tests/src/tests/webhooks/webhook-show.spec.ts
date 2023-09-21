import { Webhook, WebhookCreateDto } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

const hookName = getUniqueTitle()

let webhook: Webhook

const createWebhookDto = new WebhookCreateDto({
	url: "http://example.com",
	name: hookName,
	events: ["create.posts", "create.comments", "update.comments", "delete.tags"],
})

test.beforeAll(async ({ webhookPage: webhookPages }) => {
	await webhookPages.db.deleteByName(hookName)
	webhook = await webhookPages.db.create(createWebhookDto)
})

test.afterEach(async ({ webhookPage: webhookPages }) => {
	await webhookPages.db.deleteByName(hookName)
})

test("Show Webhook", async ({ webhookPage: webhookPages }) => {
	await webhookPages.goHome()
	await webhookPages.goToList()
	await webhookPages.goToShow(webhook.id)
	await webhookPages.hasCrudContent(createWebhookDto.name)
	await webhookPages.hasCrudContent(createWebhookDto.url)
	await webhookPages.goToEventsTab()
	// there should be 4 check marks, since we react on 4 events
	await webhookPages.hasSelectedEventsAmount(4)
})
