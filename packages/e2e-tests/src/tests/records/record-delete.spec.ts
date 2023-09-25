import { test } from "../../setup/e2e-fixture.js"

test("Delete Record", async ({ postPage, postItem }) => {
	await postPage.goToHomeUrl()
	await postPage.sidebarPostsLink.click()
	await postPage.clickOnShowRecord(postItem.id)
	await postPage.deleteButton.click()
	await postPage.confirmButton.click()
	await postPage.isOnPostsList()
})
