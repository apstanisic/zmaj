import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

const roleName = getUniqueTitle()

test.beforeEach(async ({ rolePage }) => rolePage.db.deleteByName(roleName))
test.afterEach(async ({ rolePage }) => rolePage.db.deleteByName(roleName))

test("Create role", async ({ page, rolePage }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.clickCreateButton()

	await page.getByLabel("Name").fill(roleName)
	await page.getByLabel("Description").fill("I am creating this role from playwright test!!!")

	await rolePage.clickSaveButton()
	await rolePage.elementCreatedVisible()

	let roleId = ""
	await expect(async () => {
		const role = await rolePage.db.findByName(roleName)
		expect(role).toBeDefined()
		roleId = role!.id
	}).toPass()

	await rolePage.isOnShowPage(roleId)
})
