import { expect, test } from "@playwright/test"

/**
 * This is mainly used to test that setup and teardown function work properly
 */
test("Playground", async ({ page }) => {
	await page.goto("https://www.example.com/")
	expect(1).toEqual(1)
	// console.log("In google")
	// await page.goto("https://www.youtube.com/")
	// console.log("In yt")
	// await page.goto("https://www.github.com/")
	// console.log("In github")
})
