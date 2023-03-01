import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollection } from "../utils/infra-test-helpers.js"
import { testSdk } from "../utils/test-sdk.js"

const tableName = "test_show_playwright"

test.beforeEach(async () => {
	await deleteCollection(tableName)
	await testSdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName, label: "Test345" },
	})
})

test.afterEach(async () => deleteCollection(tableName))

test("Show Collection", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmaj_collection_metadata")

	await page.getByRole("link", { name: tableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmaj_collection_metadata/$ID/show"),
	)

	await expect(page.locator("body")).toContainText("Delete")
	await expect(page.locator("body")).toContainText("Test345")
	await expect(page.locator("body")).toContainText("auto-increment")
	await expect(page.locator("body")).toContainText(tableName)
})
