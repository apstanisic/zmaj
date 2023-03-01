import { expect, test } from "@playwright/test"
import { ADMIN_ROLE_ID, sleep, UserCreateDto } from "@zmaj-js/common"
import { testSdk } from "../utils/test-sdk.js"

const email = "reset-password@example.com"

test.beforeEach(async () => {
	await testSdk.users.temp__deleteWhere({ filter: { email } })
	await testSdk.users.createOne({
		data: new UserCreateDto({
			email,
			status: "active",
			confirmedEmail: true,
			roleId: ADMIN_ROLE_ID,
		}),
	})
})
test.afterEach(async () => {
	await testSdk.users.temp__deleteWhere({ filter: { email } })
})

test("Reset password", async ({ page, context }) => {
	await page.goto("http://localhost:7100/admin/#/")
	await expect(page).toHaveURL("http://localhost:7100/admin/#/")

	// logout, since we cannot accept invitation if we are logged in
	await page.getByRole("button", { name: "More Actions" }).click()
	await page.getByRole("menuitem", { name: "Logout" }).click()

	await page.getByRole("link", { name: "Forgot password? Click here" }).click()

	await page.getByLabel("Email").fill(email)
	await page.getByRole("button", { name: /Send password reset email/ }).click()

	// go to MailHog gui
	await page.goto("http://localhost:7310")
	// method will always take at least 1500ms, hardcoded
	await sleep(2000)

	await page.getByText(/Reset password/).first().click()

	// https://playwright.dev/docs/pages#handling-new-pages
	const pagePromise = context.waitForEvent("page")
	// email is displayed in iframe
	// https://playwright.dev/docs/frames
	await page.frameLocator("#preview-html").getByRole("link", { name: "Set new password" }).click()

	const page2 = await pagePromise
	await page2.waitForLoadState()
	// it should take us to invitation page
	await expect(page2).toHaveURL(/http:\/\/localhost:7100\/admin\/#\/auth\/password-reset/)

	await page2.getByLabel(/Password/).fill("password-new")
	await page2.getByRole("button", { name: /Change Password/ }).click()

	await expect(page2).toHaveURL("http://localhost:7100/admin/#/login")

	await page2.getByLabel(/Email/).fill("admin@example.com")
	await page2.getByLabel(/Password/).fill("password")

	await page2.getByRole("button", { name: /Sign in$/ }).click()

	// we should be signed in
	await expect(page2).toHaveURL("http://localhost:7100/admin/#/")
})
