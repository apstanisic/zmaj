import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { fileUtils, uploadTestFile } from "../utils/e2e-file-utils.js"
import { toRaQuery } from "../utils/test-sdk.js"

const imgPath = "test-image-download-single.png"
const imgName = imgPath.split(".")[0]!

test.beforeEach(async ({ request }) => uploadTestFile({ request, assetsPath: imgPath }))
test.afterAll(async () => fileUtils.deleteFile(imgPath))

test("Download single file", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Files" }).click()
	// await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	const query = toRaQuery({ filter: { name: imgName } })
	await page.goto(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajFiles?${query}`)

	// idk why i need first, but it somehow has duplicates
	await page.getByText(imgName).first().click()

	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajFiles/$ID/show"))
	await expect(page.locator(".crud-content")).toContainText(`Name: ${imgName}`)
	const [download] = await Promise.all([
		page.waitForEvent("download"),
		await page.getByRole("button", { name: "Download" }).click(),
	])
	const fail = await download.failure()
	expect(fail).toBeNull()
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajFiles/$ID/show"))
})
