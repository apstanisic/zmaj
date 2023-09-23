import { test } from "../../setup/e2e-fixture.js"

test("Delete Record", async ({ postPage, postItem }) => {
	await postPage.goHome()
	await postPage.goToList()
	await postPage.goToShow(postItem.id)
	await postPage.clickDeleteButton()
	await postPage.clickConfirmButton()
	await postPage.isOnListPage()
})
