import { expect, test } from "@playwright/test"
import { Struct } from "@zmaj-js/common"
import { postUtils } from "../utils/e2e-post-utils.js"
import { namespaceCollection } from "../utils/namespace-collection.js"
// import { deleteMockPosts } from "../utils/delete-mock-posts"

const suffix = "fj98h9h9"
const title = postUtils.getRandTitle() + suffix

let record: Struct

test.beforeEach(async () => {
	record = await postUtils.create(title, { body: "<b>some bold value</b>" })
})

test.afterEach(async () => {
	await postUtils.deleteByTitle(title)
})

test("Show Record", async ({ page }) => {
	await namespaceCollection({ page, collection: "posts", suffix })

	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")
	// await page.locator("text=Posts").first().click()

	await page
		.getByRole("link", { name: /Posts$/ })
		.first()
		.click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/posts")

	// click on first row, second column (first is checkbox)
	// await page.locator("tbody > tr:nth-child(1) > td:nth-child(2)").click()
	await page.getByRole("button", { name: `Show Record ${record["id"]}` }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/posts/${record["id"]}/show`)

	await expect(page.locator("body")).toContainText(title)
	await expect(page.locator("body")).toContainText(String(record["id"]))
	// await expect(page.locator("body")).toContainText("Show All")
})
// cors  origin missing
