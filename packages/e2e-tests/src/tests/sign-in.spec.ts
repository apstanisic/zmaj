import { expect, test } from "@playwright/test"
import { emptyState } from "../state/empty-state.js"

// import emptyState from "../state/empty-state.json"
test.use({ storageState: emptyState })

// do not use auth state
// test.use({ storageState: path.join(__dirname, "../state/empty-state.json") })

test("Sign in / sign out", async ({ page }) => {
	// expect redirect to login page
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/#/login")

	await page.getByLabel("Email").fill("admin@example.com")
	await page.getByLabel(/^Password$/).fill("password")
	await page.getByRole("button", { name: /Sign in$/ }).click()

	await expect(page).toHaveURL("http://localhost:7100/admin/#/")

	/**
	 * Show be possible to navigate to users page
	 * Click on users in sidebar
	 */
	await page.getByRole("link", { name: "Users" }).click()
	// await page.locator("text=Users").click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajUsers")

	/**
	 * Show be possible to navigate to infra page
	 * Click on collections in sidebar
	 */
	await page.getByRole("link", { name: "Collections" }).click()
	// await page.locator("text=Collections").click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmaj_collection_metadata")

	/**
	 * Logout
	 * click on dropdown button in top-right
	 */
	await page.getByRole("button", { name: "More Actions" }).click()
	await page.getByRole("menuitem", { name: "Logout" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/login")
})
