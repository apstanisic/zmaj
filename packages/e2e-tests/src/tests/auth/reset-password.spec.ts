import { test } from "../../setup/e2e-fixture.js"
import { emptyState } from "../../state/empty-state.js"

test.use({ storageState: emptyState })

test("Reset password", async ({ page, context, userItem, authPage }) => {
	await authPage.goToLoginPage()

	await page.getByRole("link", { name: "Forgot password? Click here" }).click()

	await page.getByPlaceholder("Your email").fill(userItem.email)
	await page.getByRole("button", { name: /Send password reset email/ }).click()

	const emailIframe = await authPage.getLatestEmail(userItem.email, "Reset password")

	const newPage = await authPage.waitForNewPage({
		context,
		trigger: () => emailIframe.getByRole("link", { name: "Set new password" }).click(),
	})

	// switch page
	authPage.page = newPage

	await authPage.isOnPasswordResetPage()

	await newPage.getByLabel(/Password/).fill("password-new")
	await newPage.getByRole("button", { name: /Change Password/ }).click()

	await authPage.isOnLoginPage()

	await newPage.getByLabel(/Email/).fill("admin@example.com")
	await newPage.getByLabel(/Password/).fill("password")

	await authPage.signInButton.click()
	await authPage.isOnHome()
})
