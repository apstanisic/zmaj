import { expect } from "@playwright/test"
import { UnknownValues, Webhook } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

const hookName = getUniqueTitle()

test.afterEach(async ({ webhookFx }) => {
	await webhookFx.deleteWhere({ name: hookName })
})

test("Create Webhook", async ({ page, webhookPage, webhookFx }) => {
	await webhookPage.goHome()

	await webhookPage.goToList()

	await webhookPage.clickCreateRecordButton()
	await webhookPage.toHaveUrl("/create")

	await page.getByLabel("Name").fill(hookName)

	await page.getByRole("button", { name: /Http Method/ }).click()
	await page.getByRole("option", { name: /POST/ }).click()

	await page.getByLabel("Description").fill("This is created by test")

	await page.getByRole("switch", { name: "Enabled" }).click()

	await page.getByRole("switch", { name: "Send Data" }).click()

	await page.getByLabel("Url").fill("http://localhost:5000")

	await page.locator("#zmaj_input_httpHeaders").click()
	const customHeaders = {
		"test-header": "hello-world",
	}
	await page.keyboard.type(JSON.stringify(customHeaders))

	await page.getByRole("button", { name: "Next" }).click()

	// nth(0) => create; nth(1) update; nth(2) delete;
	await webhookPage.enableEvent("create", "posts")
	await webhookPage.enableEvent("create", "comments")
	await webhookPage.enableEvent("update", "comments")
	await webhookPage.enableEvent("delete", "tags")
	await webhookPage.enableEvent("update", "postsTags")
	await webhookPage.enableEvent("delete", "postsTags")

	await webhookPage.clickSaveButton()

	const created = await webhookFx.findWhere({ name: hookName })
	const id = created?.id
	expect(id).toBeDefined()

	await webhookPage.toHaveUrl(`${created!.id}/show`)

	webhookPage.hasCrudContent(hookName)

	await webhookPage.goToEventsTab()
	// there should be 6 check marks, since we react on 6 events
	await webhookPage.hasSelectedEventsAmount(6)

	expect(created).toEqual({
		id,
		name: hookName,
		httpMethod: "POST",
		httpHeaders: customHeaders,
		description: "This is created by test",
		enabled: true,
		sendData: true,
		url: "http://localhost:5000",
		events: expect.arrayContaining([
			"create.posts",
			"create.comments",
			"update.comments",
			"delete.tags",
			"update.postsTags",
			"delete.postsTags",
		]),
		createdAt: expect.anything(),
	} satisfies UnknownValues<Webhook>)
})
