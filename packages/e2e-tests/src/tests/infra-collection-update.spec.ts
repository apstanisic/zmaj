import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollection } from "../utils/infra-test-helpers.js"
import { testSdk } from "../utils/test-sdk.js"

const tableName = "playwright_collection_update_test"

test.beforeEach(async () => {
	await deleteCollection(tableName)
	await testSdk.infra.collections.createOne({
		data: {
			tableName,
			pkColumn: "id",
			pkType: "uuid",
			label: "OriginalPlaywrightUpdateCollection",
		},
	})
})

test.afterEach(async () => deleteCollection(tableName))

test("Update Collection", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: tableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await page.getByRole("button", { name: /Edit/ }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID"),
	)

	await page.getByLabel("Label").fill("UpdatedTestTable")

	await page.getByRole("button", { name: "Save" }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await expect(page.locator(".crud-content")).toContainText("playwright_collection_update_test")
	// await expect(page.locator(".crud-content")).toContainText("This is updated description")
	await expect(page.locator(".crud-content")).toContainText("UpdatedTestTable")
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
	// sidebar
	await expect(page.locator(".app-sidebar")).toContainText("UpdatedTestTable")
})
