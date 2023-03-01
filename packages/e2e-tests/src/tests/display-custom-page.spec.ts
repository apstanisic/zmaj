import { expect, test } from "@playwright/test"

// not injecting custom pages, cause it's built with production mode
test.describe.skip("Custom pages", () => {
	test("Display custom page with layout", async ({ page }) => {
		await page.goto("http://localhost:7100/admin/")
		await expect(page).toHaveURL("http://localhost:7100/admin/")

		await page.getByRole("link", { name: "Custom Page" }).click()
		await expect(page).toHaveURL("http://localhost:7100/admin/#/my/custom/path")
		// still exist sidebar
		await expect(page.locator(".app-sidebar")).toContainText("Home")
		await expect(page.locator("body")).toContainText("Custom page with layout")
	})

	test("Display custom page without layout", async ({ page }) => {
		await page.goto("http://localhost:7100/admin/")
		await expect(page).toHaveURL("http://localhost:7100/admin/")

		await page.getByRole("link", { name: "NoLayoutPage" }).click()
		await expect(page).toHaveURL("http://localhost:7100/admin/#/my/second/path")
		// still exist sidebar
		await expect(page.locator(".app-sidebar")).toHaveCount(0)
		await expect(page.locator("body")).toContainText("Custom page without layout")
	})
})
