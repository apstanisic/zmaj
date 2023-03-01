import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollection } from "../utils/infra-test-helpers.js"
import { testSdk } from "../utils/test-sdk.js"

const tableName = "field_test_update_playwright"

test.beforeEach(async () => {
	await deleteCollection(tableName)
	await testSdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName, label: "Test345" },
	})
	await testSdk.infra.fields.createOne({
		data: {
			columnName: "to_update",
			dataType: "short-text",
			tableName,
			isNullable: true,
			isUnique: false,
			dbDefaultValue: null,
		},
	})
})

test.afterEach(async () => deleteCollection(tableName))

test("Update Field", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmaj_collection_metadata")

	await page.getByRole("link", { name: tableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmaj_collection_metadata/$ID/show"),
	)

	await page.getByRole("tab", { name: "Fields" }).click()
	await page.getByRole("link", { name: "toUpdate short-text" }).click()

	await page.getByRole("button", { name: /Edit/ }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmaj_field_metadata/$ID"),
	)

	await page.getByLabel("Label").fill("Updated Label")

	await page.getByRole("button", { name: "Next" }).click()
	await page.getByRole("button", { name: "Next" }).click()
	await page.getByRole("button", { name: "Save" }).click()

	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmaj_field_metadata/$ID/show"),
	)

	await expect(page.locator(".crud-content")).toContainText(tableName)
	await expect(page.locator(".crud-content")).toContainText('Field "toUpdate"')
	await expect(page.locator(".crud-content")).toContainText("to_update")
	await expect(page.locator(".crud-content")).toContainText("short-text")
	await expect(page.locator(".crud-content")).toContainText("Updated Label")
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
})
