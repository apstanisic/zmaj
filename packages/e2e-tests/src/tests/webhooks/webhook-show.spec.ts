import { expect, test } from "@playwright/test"
import { Webhook, WebhookCreateDto } from "@zmaj-js/common"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"
import { webhookUtils } from "./webhook-utils.js"

const hookName = getUniqueTitle()

let webhook: Webhook

const createWebhookDto = new WebhookCreateDto({
	url: "http://example.com",
	name: hookName,
	events: ["create.posts", "create.comments", "update.comments", "delete.tags"],
})

test.beforeAll(async () => {
	await webhookUtils.deleteByName(hookName)
	webhook = await webhookUtils.create(createWebhookDto)
})

test.afterEach(async () => {
	await webhookUtils.deleteByName(hookName)
})

test("Show Webhook", async ({ page }) => {
	await page.goto("/")
	await expect(page).toHaveURL(new RegExp("/admin"))

	await page.getByRole("link", { name: "Webhooks" }).click()
	await expect(page).toHaveURL(new RegExp("/admin/#/zmajWebhooks"))

	await page.getByRole("button", { name: `Show Record ${webhook.id}` }).click()

	await expect(page.locator(".crud-content")).toContainText(hookName)
	await expect(page.locator(".crud-content")).toContainText("http://example.com")

	await page.getByRole("tab", { name: "Events" }).click()
	// there should be 4 check marks, since we react on 4 events
	await expect(page.getByTestId("CheckIcon")).toHaveCount(4)
})
