import { expect, test } from "@playwright/test"
import { Webhook, WebhookCreateDto } from "@zmaj-js/common"
import { testSdk } from "../utils/test-sdk.js"

const hookName = "Playwright Delete Hook"
let webhook: Webhook

test.beforeAll(async () => {
	await testSdk.webhooks.temp__deleteWhere({ filter: { name: hookName } })
	webhook = await testSdk.webhooks.createOne({
		data: new WebhookCreateDto({
			url: "http://localhost:5000",
			name: hookName,
			events: ["create.posts", "create.comments", "update.comments", "delete.tags"],
		}),
	})
})

test.afterEach(async () => {
	await testSdk.webhooks.temp__deleteWhere({ filter: { name: hookName } })
})

test("Delete Webhook", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Webhooks" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajWebhooks")

	// await page.getByText(hookName).click()

	await page.getByRole("button", { name: `Show Record ${webhook.id}` }).click()

	await page.getByRole("button", { name: /Delete/ }).click()
	await page.getByRole("button", { name: "Confirm" }).click()

	await expect(page.locator("body")).toContainText("Element deleted")
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajWebhooks")

	const withCurrentName = await testSdk.webhooks.getMany({ filter: { name: hookName } })
	expect(withCurrentName.data).toHaveLength(0)
})
