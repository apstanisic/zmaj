import { test } from "../../setup/e2e-fixture.js"
import { emptyState } from "../../state/empty-state.js"

test.use({ storageState: emptyState })

test("Sign in / sign out", async ({ page, authPage, userPage }) => {
	await page.goto("/")
	// expect redirect to login page
	await authPage.isOnLoginPage()

	await page.getByLabel("Email").fill("admin@example.com")
	await page.getByLabel(/^Password$/).fill("password")
	await page.getByRole("button", { name: /Sign in$/ }).click()

	await authPage.isOnHome()

	// Show be possible to navigate to users page, click on users in sidebar
	await userPage.goToList()

	await authPage.logout()
})
