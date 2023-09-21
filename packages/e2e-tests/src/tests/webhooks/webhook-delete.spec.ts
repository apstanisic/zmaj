import { expect } from "@playwright/test"
import { Webhook, WebhookCreateDto } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

const hookName = getUniqueTitle()
let webhook: Webhook

const createWebhookDto = new WebhookCreateDto({
	url: "http://localhost:5000",
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

test("Delete Webhook", async ({ webhookPage: webhookPages }) => {
	await webhookPages.goHome()
	await webhookPages.goToList()
	await webhookPages.goToShow(webhook.id)

	await webhookPages.clickDeleteButton()
	await webhookPages.clickConfirmButton()

	await webhookPages.hasBodyContent("Element deleted")
	await webhookPages.isOnRootPage()

	const webhookInDb = await webhookPages.db.findByName(hookName)
	expect(webhookInDb).toBeUndefined()
})
