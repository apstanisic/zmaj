import { expect } from "@playwright/test"
import { UnknownValues, Webhook, uuidRegex } from "@zmaj-js/common"
import { sleep } from "radash"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

const hookName = getUniqueTitle()

test.afterEach(async ({ webhookFx }) => {
	await webhookFx.deleteWhere({ name: hookName })
})

test("Create Webhook", async ({ page, webhookPage, webhookFx, selectorFx }) => {
	await webhookPage.goHome()

	await webhookPage.goToList()

	await webhookPage.clickCreateRecordButton()
	await webhookPage.toHaveUrl("/create")

	// await page.getByLabel("Name").fill(hookName)
	await selectorFx.textInput("Name").fill(hookName)

	// await page.getByLabel("HTTP Method").click()
	// await page.getByRole("option", { name: /POST/ }).click()
	await selectorFx.pickSelectValue("HTTP Method", "POST")
	await selectorFx.multilineTextInput("Description").fill("This is created by test")
	// await page.getByLabel("Description").fill("This is created by test")

	await selectorFx.switchInput("Enabled").click()
	// await page.locator("label").getByText("Enabled").click()
	await selectorFx.switchInput("Send data").click()

	await selectorFx.urlInput("URL").fill("http://localhost:5000")

	// await page.locator("#zmaj_input_httpHeaders").click()
	page.locator("label").getByText("HTTP Headers (as JSON)").click()
	// await page.getByLabel("HTTP Headers (as JSON)").click()
	const customHeaders = {
		"test-header": "hello-world",
	}
	await sleep(100)
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

	let created: Webhook | undefined

	await expect(async () => {
		created = await webhookFx.findWhere({ name: hookName })
		expect(created).toBeDefined()
	}).toPass()

	await webhookPage.toHaveUrl(`${created!.id}/show`)

	webhookPage.hasCrudContent(hookName)

	await webhookPage.goToEventsTab()
	// there should be 6 check marks, since we react on 6 events
	await webhookPage.hasSelectedEventsAmount(6)

	expect(created).toEqual({
		id: expect.stringMatching(uuidRegex),
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
