import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { fileUtils, uploadTestFile } from "../utils/e2e-file-utils.js"
import { toRaQuery } from "../utils/test-sdk.js"

const img = "test-image-update.png"
const imgName = "test-image-update"

test.beforeEach(async ({ request }) => uploadTestFile({ request, assetsPath: img }))
test.afterAll(async () => fileUtils.deleteFile(imgName))

test("Update file", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Files" }).click()
	// await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	const query = toRaQuery({ filter: { name: imgName } })
	await page.goto(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajFiles?${query}`)

	await page.getByText(imgName).click()

	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajFiles/$ID/show"))

	await expect(page.locator(".crud-content")).not.toContainText(`Description: This is description`)

	await page.getByRole("button", { name: "Edit" }).click()

	await page.getByLabel("Description").fill("This is description")

	await page.getByRole("button", { name: "Save" }).click()

	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajFiles/$ID/show"))

	await expect(page.locator(".crud-content")).toContainText(`Name: ${imgName}`)
	await expect(page.locator(".crud-content")).toContainText(`Description: This is description`)
})
