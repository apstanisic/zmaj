import { expect } from "@playwright/test"
import { User } from "zmaj"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueEmail } from "../../setup/e2e-unique-id.js"

let user: User

test.afterEach(async ({ userFx }) => {
	await userFx.removeWhere({ id: user.id })
})

test("Invite user", async ({ page, context, userPage, userFx }) => {
	const email = getUniqueEmail()

	await userPage.goHome()
	await userPage.goToList()
	await userPage.clickCreateRecordButton()

	await page.getByRole("switch", { name: "Confirmed Email" }).click()

	await page.getByLabel(/^Email$/).fill(email)

	await page.getByRole("button", { name: /Status/ }).click()
	await page.getByRole("option", { name: /Invited/ }).click()

	await page.locator("form #zmaj_x2o_input_roleId").locator("button").click()
	await page.getByRole("button", { name: "Admin" }).click()

	await userPage.clickSaveButton()

	await expect(async () => {
		const dbUser = await userFx.findWhere({ email })
		expect(dbUser).toBeDefined()
		user = dbUser!
	}).toPass()

	await userPage.isOnShowPage(user.id)

	// logout, since we cannot accept invitation if we are logged in
	await page.getByRole("button", { name: "More Actions" }).click()
	await page.getByRole("menuitem", { name: "Logout" }).click()

	// go to MailHog gui
	await page.goto("http://localhost:7310")
	await page
		.getByText(/Invitation/)
		.first()
		.click()

	// https://playwright.dev/docs/pages#handling-new-pages
	const pagePromise = context.waitForEvent("page", { timeout: 6000 })
	// email is displayed in iframe
	// https://playwright.dev/docs/frames
	await page.frameLocator("#preview-html").getByRole("link", { name: "Accept invitation" }).click()

	const page2 = await pagePromise
	await page2.waitForLoadState()
	// it should take us to invitation page
	await expect(page2).toHaveURL(/http:\/\/localhost:7100\/admin\/#\/auth\/invite/)

	await page2.getByLabel(/First Name/).fill("End")
	await page2.getByLabel(/Last Name/).fill("Test")
	await page2.getByLabel(/Password/).fill("my-password")
	await page2.getByRole("button", { name: /Sign Up/ }).click()

	// we should be signed in
	await expect(page2).toHaveURL("http://localhost:7100/admin/#/")
})
