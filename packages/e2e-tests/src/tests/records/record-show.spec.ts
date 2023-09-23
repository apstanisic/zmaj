import { test } from "../../setup/e2e-fixture.js"

test("Show Record", async ({ postPage, postItem }) => {
	await postPage.goHome()
	await postPage.goToList()
	await postPage.goToShow(postItem.id)

	await postPage.hasBodyContent(postItem.id)
	await postPage.hasBodyContent(postItem.title)
	await postPage.hasBodyContent(postItem.body)
})
