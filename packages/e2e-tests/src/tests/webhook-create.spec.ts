import { expect, test } from "@playwright/test"
import { UnknownValues, Webhook } from "@zmaj-js/common"
import { getSdk } from "../utils/e2e-get-sdk.js"
import { getIdFromShow } from "../utils/test-sdk.js"

const hookName = "Playwright Created"

test.beforeAll(async () => {
	await getSdk().webhooks.temp__deleteWhere({ filter: { name: hookName } })
})

test.afterEach(async () => {
	await getSdk().webhooks.temp__deleteWhere({ filter: { name: hookName } })
})

test("Create Webhook", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Webhooks" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajWebhooks")

	await page.getByRole("button", { name: /Create record/ }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajWebhooks/create")

	await page.getByLabel("Name").fill(hookName)

	await page.getByRole("button", { name: /Http Method/ }).click()
	await page.getByRole("option", { name: /POST/ }).click()
	// await page.locator("form #zmaj_input_httpMethod").locator("button").click()
	// await page.locator("form #zmaj_input_httpMethod").getByText("POST").click()

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
	await page.getByRole("button", { name: /Enable event create.posts$/ }).click()
	await page.getByRole("button", { name: "Enable event create.comments" }).click()
	await page.getByRole("button", { name: "Enable event update.comments" }).click()
	await page.getByRole("button", { name: "Enable event delete.tags" }).click()
	await page.getByRole("button", { name: "Enable event update.postsTags" }).click()
	await page.getByRole("button", { name: "Enable event delete.postsTags" }).click()
	//
	// await page.getByRole("row", { name: "posts" }).getByRole("button").nth(0).click()
	// await page.getByRole("row", { name: "comments" }).getByRole("button").nth(0).click()
	// await page.getByRole("row", { name: "comments" }).getByRole("button").nth(1).click()
	// await page.getByRole("row", { name: "tags" }).getByRole("button").nth(2).click()
	// await page.getByRole("row", { name: "posts_tags" }).getByRole("button").nth(1).click()
	// await page.getByRole("row", { name: "posts_tags" }).getByRole("button").nth(2).click()

	await page.getByRole("button", { name: "Save" }).click()

	const created = await getSdk().webhooks.getOne({ filter: { name: hookName } })
	// if (!created?.id) {
	// 	console.log({ created })
	// 	throwErr("432786")
	// }

	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajWebhooks/${created?.id}/show`)

	await expect(page.locator(".crud-content")).toContainText("Playwright Created")
	await page.getByRole("tab", { name: "Events" }).click()
	// there should be 6 check marks, since we react on 6 events
	await expect(page.getByTestId("CheckIcon")).toHaveCount(6)

	const id = getIdFromShow(page.url())
	expect(created).toEqual({
		id,
		name: "Playwright Created",
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
