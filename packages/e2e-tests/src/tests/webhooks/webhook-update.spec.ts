import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

test.beforeEach(async ({ webhookFx, webhookItem }) => {
	await webhookFx.update(webhookItem.id, {
		events: [
			"create.posts",
			"create.comments",
			"update.comments",
			"delete.tags", //
		],
	})
})

test("Update Webhook", async ({ webhookFx, webhookPage, page, webhookItem }) => {
	await webhookPage.goHome()
	await webhookPage.goToList()
	await webhookPage.goToShow(webhookItem.id)
	await webhookPage.clickEditButtonInList(webhookItem.id)

	const newName = getUniqueTitle()

	await page.getByLabel("Name").fill(newName)
	await page.getByRole("switch", { name: "Enabled" }).click()
	await page.getByRole("button", { name: "Next" }).click()

	// removing
	await page.getByRole("button", { name: "Disable event create.posts" }).click()
	await page.getByRole("button", { name: "Disable event update.comments" }).click()

	//adding
	await page.getByRole("button", { name: "Enable event delete.comments" }).click()
	await page.getByRole("button", { name: "Enable event create.tags" }).click()
	await page.getByRole("button", { name: "Enable event update.tags" }).click()

	// there should be 5: start with 4, remove 2, add 3
	// there should be 5 check marks, since we react on 5 events
	await webhookPage.hasSelectedEventsAmount(5)

	await webhookPage.clickSaveButton()

	await webhookPage.hasBodyContent("Element updated")
	await webhookPage.toHaveUrl(`${webhookItem.id}/show`)

	const updated = await webhookFx.findWhere({ id: webhookItem.id })
	expect(updated).toMatchObject({
		id: webhookItem.id,
		name: newName,
		enabled: true,
		events: expect.arrayContaining([
			"create.comments",
			"delete.tags",
			//
			"delete.comments",
			"create.tags",
			"update.tags",
		]),
	})
})
