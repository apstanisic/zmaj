import { expect } from "@playwright/test"
import { TPost } from "@zmaj-js/test-utils"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

let post: TPost | undefined

test.afterEach(async ({ postFx }) => postFx.removeWhere({ id: post!.id }))

test("Create Record", async ({ page, postPage, postFx }) => {
	const title = getUniqueTitle()

	await postPage.goHome()
	await postPage.goToList()
	await postPage.clickCreateRecordButton()

	await page.getByLabel("Title").fill(title)
	// await page.locator("#zmaj_input_body").click()
	// await page.locator("#zmaj_input_body").type("Some body value")
	await page.getByLabel("Body").fill("Some body value")
	await page.getByLabel("Likes").fill("5")
	await postPage.clickSaveButton()

	await expect(async () => {
		post = await postFx.findWhere({ title })
		expect(post).toBeDefined()
	}).toPass()

	await postPage.isOnShowPage(post!.id)
	await postPage.hasCrudContent(title)
})
