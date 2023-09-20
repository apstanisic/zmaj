import { expect, test } from "@playwright/test"
import { Webhook, WebhookCreateDto } from "@zmaj-js/common"
import { HOME_PAGE_REGEX } from "../../setup/e2e-consts.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"
import { webhookUtils } from "./webhook-utils.js"

const hookName = getUniqueTitle()
let webhook: Webhook

const createWebhookDto = new WebhookCreateDto({
	url: "http://localhost:5000",
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

test("Delete Webhook", async ({ page }) => {
	await page.goto("/")
	await expect(page).toHaveURL(HOME_PAGE_REGEX)

	await page.getByRole("link", { name: "Webhooks" }).click()
	await expect(page).toHaveURL(new RegExp("/admin/#/zmajWebhooks"))

	await page.getByRole("button", { name: `Show Record ${webhook.id}` }).click()

	await page.getByRole("button", { name: /Delete/ }).click()
	await page.getByRole("button", { name: "Confirm" }).click()

	await expect(page.locator("body")).toContainText("Element deleted")
	await expect(page).toHaveURL(new RegExp("/admin/#/zmajWebhooks"))

	const webhookInDb = await webhookUtils.findByName(hookName)
	expect(webhookInDb).toBeUndefined()
})
