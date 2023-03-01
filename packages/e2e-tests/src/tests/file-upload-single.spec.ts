import { expect, test } from "@playwright/test"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { deleteTestFile } from "../utils/test-file-helpers.js"

test.beforeEach(async () => deleteTestFile("test-image-single.png"))
test.afterAll(async () => deleteTestFile("test-image-single.png"))

test("Upload single file", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Files" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajFiles")

	await page.getByRole("button", { name: "Upload" }).click()

	// https://playwright.dev/docs/input#upload-files
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByText("Drop some files here, or click to select files").click(),
	])
	const currentFolder = dirname(fileURLToPath(import.meta.url))
	await fileChooser.setFiles(join(currentFolder, "../../assets/test-image-single.png"))

	// hide upload dialog since it remains open, if user wants to upload multiple files.
	// maybe close by default?
	await page.keyboard.press("Escape")

	await expect(page.locator("body")).toContainText("Upload successful")
})
