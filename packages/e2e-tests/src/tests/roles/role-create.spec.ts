import { expect } from "@playwright/test"
import { Role } from "zmaj"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

let role: Role

test.afterEach(async ({ fxRoleDb }) => fxRoleDb.delete(role))

test("Create role", async ({ page, rolePage, fxRoleDb }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.clickCreateRecordButton()

	const name = getUniqueTitle()

	await page.getByLabel("Name").fill(name)
	await page.getByLabel("Description").fill("I am creating this role from playwright test!!!")

	await rolePage.clickSaveButton()
	await rolePage.elementCreatedVisible()

	await expect(async () => {
		const dbRole = await fxRoleDb.findByName(name)
		expect(dbRole).toBeDefined()
		role = dbRole!
	}).toPass()

	await rolePage.isOnShowPage(role.id)
})
