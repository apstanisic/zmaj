import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueId } from "../../setup/e2e-unique-id.js"

const email = `${getUniqueId()}@example.com`

test.beforeEach(async ({ userPage }) => userPage.db.removeByEmail(email))
test.afterEach(async ({ userPage }) => userPage.db.removeByEmail(email))

test("Create User", async ({ page, userPage }) => {
	await userPage.goHome()
	await userPage.goToList()
	await userPage.clickCreateButton()

	await page.getByRole("switch", { name: "Confirmed Email" }).click()

	await page.getByLabel("First Name").fill("Play")
	await page.getByLabel("Last Name").fill("Wright")
	await page.getByLabel(/^Email$/).fill(email)

	await page.getByRole("button", { name: /Status/ }).click()
	await page.getByRole("option", { name: /Disabled/ }).click()

	await page.locator("form #zmaj_x2o_input_roleId").locator("button").click()
	await page.getByRole("button", { name: "Public" }).click()

	await userPage.clickSaveButton()

	let userId = ""
	await expect(async () => {
		const user = await userPage.db.findByEmail(email)
		expect(user).toBeDefined()
		userId = user!.id
	}).toPass()

	await userPage.toHaveUrl(`${userId}/show`)
})
