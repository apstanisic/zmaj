import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollection } from "../utils/infra-test-helpers.js"
import { testSdk } from "../utils/test-sdk.js"

const tableName = "field_test_delete_playwright"

test.beforeEach(async () => {
	await deleteCollection(tableName)
	await testSdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName, label: "Test345" },
	})
	await testSdk.infra.fields.createOne({
		data: {
			columnName: "to_delete",
			dataType: "short-text",
			tableName,
			isNullable: true,
			isUnique: false,
			dbDefaultValue: null,
		},
	})
})

test.afterEach(async () => deleteCollection(tableName))

test("Delete Field", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmaj_collection_metadata")

	await page.getByRole("link", { name: tableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmaj_collection_metadata/$ID/show"),
	)

	await page.getByRole("tab", { name: "Fields" }).click()
	await page.getByRole("link", { name: "toDelete short-text" }).click()

	await page.getByRole("button", { name: /Delete/ }).click()
	await page.getByRole("button", { name: "Confirm" }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmaj_collection_metadata/$ID/show"),
	)

	await expect(page.locator(".crud-content")).toContainText(tableName)
	await expect(page.locator(".crud-content")).toContainText("auto-increment")
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
})
