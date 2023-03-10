import { expect, test } from "@playwright/test"
import { qsStringify, Struct } from "@zmaj-js/common"
import { createPost, deletePostsByTitle } from "../utils/test-post-helpers.js"

const title = "e2e-record-delete-gui-test"

let record: Struct

test.beforeEach(async () => {
	record = await createPost(title, { body: "<b>e2e record delete gui test</b>" })
})
test.afterEach(async () => deletePostsByTitle(title))

test("Delete Record", async ({ page }) => {
	// it throws without above 2 lines, there is no record context, see why
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")
	// const filter = encodeRaFilter({ title })
	const query = qsStringify({ filter: JSON.stringify({ title }) })
	await page.goto(`http://localhost:7100/admin/#/posts?${query}`)
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/posts?${query}`)

	// click on first row, second column (first is checkbox)
	// await page.locator("tbody > tr:nth-child(1) > td:nth-child(2)").click()
	await page.getByRole("button", { name: "Show Record " + record["id"] }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/posts/${record["id"]}/show`)
	await expect(page.locator("body")).toContainText(title)

	await page.getByRole("button", { name: /Delete/ }).click()
	await page.getByText("Confirm").click()

	await expect(page).toHaveURL("http://localhost:7100/admin/#/posts")
})
