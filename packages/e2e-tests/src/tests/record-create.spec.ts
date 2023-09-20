import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { postUtils } from "../utils/e2e-post-utils.js"

const postTitle = postUtils.getRandTitle()

test.afterEach(async () => postUtils.deleteByTitle(postTitle))

test("Create Record", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page
		.getByRole("link", { name: /Posts$/ })
		.first()
		.click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/posts")

	await page.getByRole("button", { name: /Create record/ }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/posts/create")

	await page.getByLabel("Title").fill(postTitle)
	// await page.locator("#zmaj_input_body").click()
	// await page.locator("#zmaj_input_body").type("Some body value")
	await page.getByLabel("Body").fill("Some body value")
	await page.getByLabel("Likes").fill("5")
	await page.getByRole("button", { name: "Save" }).click()

	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/posts/$ID/show"))
	await expect(page.locator(".crud-content h1")).toContainText(postTitle)
})
