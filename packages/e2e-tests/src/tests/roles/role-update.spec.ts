import { faker } from "@faker-js/faker"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

test("Update Role", async ({ page, rolePage, zRole }) => {
	const updatedRoleName = getUniqueTitle()

	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.clickEditButtonInList(zRole.id)

	await rolePage.isOnEditPage(zRole.id)

	const updatedDescription = faker.lorem.sentence()
	await page.getByLabel("Name").fill(updatedRoleName)
	await page.getByLabel("Description").fill(updatedDescription)

	await rolePage.clickSaveButton()

	await rolePage.isOnShowPage(zRole.id)
	await rolePage.elementUpdatedVisible()

	await rolePage.hasCrudContent(updatedRoleName)
	await rolePage.hasCrudContent(updatedDescription)
})
