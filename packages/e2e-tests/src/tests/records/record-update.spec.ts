import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

test("Update Record", async ({ page, postPage, postItem }) => {
	await postPage.goToHomeUrl()
	await postPage.sidebarPostsLink.click()
	await postPage.clickOnShowRecord(postItem.id)
	await postPage.editButton.click()

	const newTitle = getUniqueTitle()
	await postPage.titleInput.fill(newTitle)

	await postPage.saveButton.click()
	await postPage.isOnShowPageUrl(postItem.id)
	await postPage.hasInBody(newTitle)
})
