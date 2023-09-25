import { test } from "../../setup/e2e-fixture.js"

test("Delete Role", async ({ rolePage, zRole }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(zRole.id)
	await rolePage.clickDeleteButton()
	await rolePage.clickConfirmButton()
	await rolePage.isOnListPage()
	await rolePage.elementDeletedVisible()
})
