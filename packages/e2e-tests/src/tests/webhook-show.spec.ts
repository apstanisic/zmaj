import { expect, test } from "@playwright/test"
import { Webhook, WebhookCreateDto } from "@zmaj-js/common"
import { getSdk } from "../utils/getSdk.js"

const hookName = "Playwright Show Hook"

let webhook: Webhook

test.beforeAll(async () => {
	const sdk = getSdk()
	await sdk.webhooks.temp__deleteWhere({ filter: { name: hookName } })
	webhook = await sdk.webhooks.createOne({
		data: new WebhookCreateDto({
			url: "http://example.com",
			name: hookName,
			events: ["create.posts", "create.comments", "update.comments", "delete.tags"],
		}),
	})
})

test.afterEach(async () => {
	await getSdk().webhooks.temp__deleteWhere({ filter: { name: hookName } })
})

test("Show Webhook", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Webhooks" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajWebhooks")

	await page.getByRole("button", { name: `Show Record ${webhook.id}` }).click()

	await expect(page.locator(".crud-content")).toContainText(hookName)
	await expect(page.locator(".crud-content")).toContainText("http://example.com")

	await page.getByRole("tab", { name: "Events" }).click()
	// there should be 4 check marks, since we react on 4 events
	await expect(page.getByTestId("CheckIcon")).toHaveCount(4)
})
