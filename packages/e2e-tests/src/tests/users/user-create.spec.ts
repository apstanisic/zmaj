import { faker } from "@faker-js/faker"
import { expect } from "@playwright/test"
import { User } from "zmaj"
import { test } from "../../setup/e2e-fixture.js"

let user: User

test.afterEach(async ({ userFx }) => {
	await userFx.removeWhere({ id: user.id })
})

test("Create User", async ({ page, userPage, userFx }) => {
	const data = {
		email: faker.internet.email({ provider: "example.test" }),
		firstName: "Play",
		lastName: "Wright",
	}

	await userPage.goHome()
	await userPage.goToList()
	await userPage.clickCreateRecordButton()

	// await page.getByRole("switch", { name: "Confirmed Email" }).click()
	await page.getByText("Confirmed Email", { exact: true }).click()

	await page.getByLabel("First Name").fill(data.firstName)
	await page.getByLabel("Last Name").fill(data.lastName)
	await page.getByLabel(/^Email$/).fill(data.email)

	// await page.getByRole("button", { name: /Status/ }).click()
	await page.getByLabel("Status").click()
	await page.getByRole("option", { name: /Disabled/ }).click()

	await page.getByLabel("Role").click()
	await page.getByRole("button", { name: "Public" }).click()

	await userPage.clickSaveButton()

	await expect(async () => {
		const dbUser = await userFx.findWhere({ email: data.email })
		expect(dbUser).toBeDefined()
		user = dbUser!
	}).toPass()

	await userPage.toHaveUrl(`${user.id}/show`)
})
