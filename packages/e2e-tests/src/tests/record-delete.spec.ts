import { expect, test } from "@playwright/test"
import { Struct, qsStringify } from "@zmaj-js/common"
import { postUtils } from "../utils/e2e-post-utils.js"

const title = postUtils.getRandTitle()

let record: Struct

test.beforeEach(async () => {
	record = await postUtils.create(title, { body: "<b>e2e record delete gui test</b>" })
})
test.afterEach(async () => postUtils.deleteByTitle(title))

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
