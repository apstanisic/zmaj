import { faker } from "@faker-js/faker"
import { Role } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

const updatedRoleName = getUniqueTitle()
let role: Role

test.beforeEach(async ({ rolePage }) => {
	role = await rolePage.db.create({ name: getUniqueTitle(), description: "Hello World!!!" })
})

test.afterEach(async ({ rolePage }) => {
	await rolePage.db.deleteByName(role.name)
	await rolePage.db.deleteByName(updatedRoleName)
})

test("Update Role", async ({ page, rolePage }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.clickEditButton(role.id)

	await rolePage.isOnEditPage(role.id)

	const updatedDescription = faker.lorem.sentence()
	await page.getByLabel("Name").fill(updatedRoleName)
	await page.getByLabel("Description").fill(updatedDescription)

	await rolePage.clickSaveButton()

	await rolePage.isOnShowPage(role.id)
	await rolePage.elementUpdatedVisible()

	await rolePage.hasCrudContent(updatedRoleName)
	await rolePage.hasCrudContent(updatedDescription)
})
