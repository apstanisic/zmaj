import { test } from "../../setup/e2e-fixture.js"

test("Delete single file", async ({ filePage, fileItem }) => {
	await filePage.goHome()
	await filePage.goToListWithQuery({ filter: { name: fileItem.name } })
	await filePage.clickOnFileName(fileItem.name)
	await filePage.isOnFileShowPage(fileItem)
	await filePage.clickDeleteButton()
	await filePage.clickConfirmButton()
	await filePage.isOnListPage()
	await filePage.elementDeletedVisible()
})
