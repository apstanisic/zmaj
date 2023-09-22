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

test.beforeEach(async ({ webhookPage }) => {
	await webhookPage.db.deleteByName(hookName)
	webhook = await webhookPage.db.create(createWebhookDto)
})

test.afterEach(async ({ webhookPage }) => {
	await webhookPage.db.deleteByName(hookName)
})

test("Delete Webhook", async ({ webhookPage }) => {
	await webhookPage.goHome()
	await webhookPage.goToList()
	await webhookPage.goToShow(webhook.id)

	await webhookPage.clickDeleteButton()
	await webhookPage.clickConfirmButton()

	await webhookPage.hasBodyContent("Element deleted")
	await webhookPage.isOnRootPage()

	const webhookInDb = await webhookPage.db.findByName(hookName)
	expect(webhookInDb).toBeUndefined()
})
