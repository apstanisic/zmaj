import { expect, test } from "@playwright/test"
import { qsStringify, Struct } from "@zmaj-js/common"
import { createPost, deletePostsByTitle } from "../utils/test-post-helpers.js"

const originalPostTitle = "e2e-record-update-gui-test"
const updatedPostTitle = "e2e-record-update-gui-test-updated"

let record: Struct

test.beforeEach(
	async () => (record = await createPost(originalPostTitle, { body: "<b>some bold value</b>" })),
)
test.afterEach(async () => {
	await deletePostsByTitle(originalPostTitle)
	await deletePostsByTitle(updatedPostTitle)
})

test("Update Record", async ({ page }) => {
	// it throws without above 2 lines, there is no record context, see why
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	// const filter = encodeRaFilter({ title: originalPostTitle })
	const query = qsStringify({ filter: JSON.stringify({ title: originalPostTitle }) })
	await page.goto(`http://localhost:7100/admin/#/posts?${query}`)

	// click on first row, second column (first is checkbox)
	// await page.locator("tbody > tr:nth-child(1) > td:nth-child(2)").click()
	await page.getByRole("button", { name: `Show Record ${record["id"]}` }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/posts/${record["id"]}/show`)
	await expect(page.locator(".crud-content h1")).toContainText(originalPostTitle)

	// Click text=Edit
	// await page.locator("text=Edit").click()
	await page.getByRole("button", { name: /Edit/ }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/posts/${record["id"]}`)

	await page.getByLabel("Title").fill(updatedPostTitle)
	// Click #body > div:nth-child(2)
	// await page.locator("input[name=title]").click()
	// await page.locator("input[name=title]").fill(updatedPostTitle)

	// Click text=Save
	await page.getByRole("button", { name: "Save" }).click()
	// await page.locator("text=Save").click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/posts/${record["id"]}/show`)
	// await expect(page.locator("body")).toContainText(updatedPostTitle)
	await expect(page.locator(".crud-content h1")).toContainText(updatedPostTitle)
})
