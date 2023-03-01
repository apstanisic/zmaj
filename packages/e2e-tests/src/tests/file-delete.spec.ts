import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteTestFile, uploadTestFile } from "../utils/test-file-helpers.js"
import { toRaQuery } from "../utils/test-sdk.js"

const img = "test-image-delete.png"
const imgName = "test-image-delete"

test.beforeEach(async ({ request }) =>
	uploadTestFile({ request, assetsPath: img, customName: imgName }),
)
test.afterAll(async () => deleteTestFile(imgName))

test("Delete single file", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Files" }).click()
	// await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	const query = toRaQuery({ filter: { name: imgName } })
	await page.goto(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	await page.getByText(imgName).click()
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajFiles/$ID/show"))
	await page.getByRole("button", { name: /Delete/ }).click()
	await page.getByRole("button", { name: "Confirm" }).click()
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajFiles"))
	await expect(page.locator("body")).toContainText("Element deleted")
})
