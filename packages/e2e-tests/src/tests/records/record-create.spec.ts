import { expect } from "@playwright/test"
import { TPost } from "@zmaj-js/test-utils"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

let post: TPost | undefined

test.afterEach(async ({ postFx }) => postFx.removeWhere({ id: post!.id }))

test("Create Record", async ({ postPage, postFx }) => {
	const title = getUniqueTitle()

	await postPage.goToHomeUrl()
	await postPage.sidebarPostsLink.click()
	await postPage.createRecordButton.click()

	await postPage.titleInput.fill(title)
	// await page.locator("#zmaj_input_body").click()
	// await page.locator("#zmaj_input_body").type("Some body value")
	await postPage.bodyInput.fill("Some body value")
	await postPage.likesInput.fill("5")
	await postPage.saveButton.click()

	await expect(async () => {
		post = await postFx.findWhere({ title })
		expect(post).toBeDefined()
	}).toPass()

	await postPage.isOnShowPageUrl(post!.id)
	await postPage.hasInBody(title)
})
