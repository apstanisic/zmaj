import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

test("Update Record", async ({ page, postPage, postItem }) => {
	await postPage.goHome()
	await postPage.goToList()
	await postPage.goToShow(postItem.id)
	await postPage.clickEditButton()

	const newTitle = getUniqueTitle()

	await page.getByLabel("Title").fill(newTitle)
	// Click #body > div:nth-child(2)
	// await page.locator("input[name=title]").click()
	// await page.locator("input[name=title]").fill(updatedPostTitle)

	await postPage.clickSaveButton()
	await postPage.isOnShowPage(postItem.id)
	await postPage.hasCrudContent(newTitle)
})
