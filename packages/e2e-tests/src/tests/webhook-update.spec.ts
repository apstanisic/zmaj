import { expect, test } from "@playwright/test"
import { Webhook, WebhookCreateDto } from "@zmaj-js/common"
import { createIdRegex } from "../utils/create-id-regex.js"
import { getSdk } from "../utils/getSdk.js"
import { getIdFromShow } from "../utils/test-sdk.js"

const hookName = "Playwright Update Hook"
const updatedName = "UpdatedTestName"

let webhook: Webhook

test.beforeAll(async () => {
	const sdk = getSdk()
	await sdk.webhooks.temp__deleteWhere({ filter: { name: hookName } })
	await sdk.webhooks.temp__deleteWhere({ filter: { name: updatedName } })
	webhook = await sdk.webhooks.createOne({
		data: new WebhookCreateDto({
			url: "http://localhost:5000",
			name: hookName,
			events: [
				"create.posts",
				"create.comments",
				"update.comments",
				"delete.tags", //
			],
		}),
	})
})

test.afterEach(async () => {
	const sdk = getSdk()
	await sdk.webhooks.temp__deleteWhere({ filter: { name: hookName } })
	await sdk.webhooks.temp__deleteWhere({ filter: { name: updatedName } })
})

test("Update Webhook", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Webhooks" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajWebhooks")

	await page.getByRole("button", { name: `Show Record ${webhook.id}` }).click()

	await page.getByRole("button", { name: /Edit/ }).click()

	await page.getByLabel("Name").fill(updatedName)

	await page.getByRole("switch", { name: "Enabled" }).click()

	await page.getByRole("button", { name: "Next" }).click()

	// nth(0) => create; nth(1) update; nth(2) delete;

	// removing
	// remove create posts
	await page.getByRole("button", { name: "Disable event create.posts" }).click()
	// await page.getByRole("row", { name: "posts" }).getByRole("button").nth(0).click()
	// remove update comments
	await page.getByRole("button", { name: "Disable event update.comments" }).click()
	// await page.getByRole("row", { name: "comments" }).getByRole("button").nth(1).click()

	//adding
	// add delete comments
	await page.getByRole("button", { name: "Enable event delete.comments" }).click()
	// await page.getByRole("row", { name: "comments" }).getByRole("button").nth(2).click()
	// add create tags
	await page.getByRole("button", { name: "Enable event create.tags" }).click()
	// await page.getByRole("row", { name: "tags" }).getByRole("button").nth(0).click()
	// add update tags
	await page.getByRole("button", { name: "Enable event update.tags" }).click()
	// await page.getByRole("row", { name: "tags" }).getByRole("button").nth(1).click()

	// there should be 5: start with 4, remove 2, add 3
	// there should be 5 check marks, since we react on 5 events
	await expect(page.getByTestId("CheckIcon")).toHaveCount(5)

	await page.getByRole("button", { name: "Save" }).click()

	await expect(page.locator("body")).toContainText("Element updated")
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajWebhooks/$ID/show"))

	const id = getIdFromShow(page.url())
	const res = await getSdk().webhooks.getById({ id })
	expect(res).toMatchObject({
		id,
		name: updatedName,
		enabled: true,
		events: expect.arrayContaining([
			"create.comments",
			"delete.tags",
			//
			"delete.comments",
			"create.tags",
			"update.tags",
		]) as any,
	} as Webhook)
})
