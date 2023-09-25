import { test } from "../../setup/e2e-fixture.js"

test("Show Role", async ({ rolePage, zRole }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(zRole.id)
	await rolePage.isOnShowPage(zRole.id)

	await rolePage.hasCrudContent(zRole.name)
	await rolePage.hasCrudContent(zRole.description)
})
