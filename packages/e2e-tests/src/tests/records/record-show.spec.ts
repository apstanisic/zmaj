import { test } from "../../setup/e2e-fixture.js"

test("Show Record", async ({ postPage, postItem }) => {
	await postPage.goToHomeUrl()
	await postPage.sidebarPostsLink.click()
	await postPage.clickOnShowRecord(postItem.id)

	await postPage.hasInBody(postItem.id)
	await postPage.hasInBody(postItem.title)
	await postPage.hasInBody(postItem.body)
})
