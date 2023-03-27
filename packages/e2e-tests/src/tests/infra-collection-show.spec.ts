import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollectionByTable } from "../utils/infra-test-helpers.js"
import { getSdk } from "../utils/test-sdk.js"

const tableName = "test_show_playwright"

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteCollectionByTable(tableName, sdk)
	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName, label: "Test345" },
	})
})

test.afterEach(async () => deleteCollectionByTable(tableName))

test("Show Collection", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: tableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await expect(page.locator("body")).toContainText("Delete")
	await expect(page.locator("body")).toContainText("Test345")
	await expect(page.locator("body")).toContainText("auto-increment")
	await expect(page.locator("body")).toContainText(tableName)
})
