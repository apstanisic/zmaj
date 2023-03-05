import { expect, test } from "@playwright/test"
import { createIdRegex, uuidInsideRegex } from "../utils/create-id-regex.js"
import { deleteCollection } from "../utils/infra-test-helpers.js"
import { testSdk } from "../utils/test-sdk.js"

const tableName = "field_test_create_playwright"

test.beforeEach(async () => {
	await deleteCollection(tableName)
	await testSdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName, label: "Test345" },
	})
})

test.afterEach(async () => deleteCollection(tableName))

test("Create Field", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: tableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	// click on fields
	await page.getByRole("tab", { name: "Fields" }).click()
	await page.getByRole("button", { name: "Add field" }).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajFieldMetadata/create?source={%22tableName%22:%22${tableName}%22}`,
	)

	await page.getByLabel("Column Name").fill("test_field")
	await page.getByLabel("Label").fill("Test Label")

	await page.getByRole("button", { name: "Next" }).click()
	await page.getByRole("button", { name: "Next" }).click()
	await page.getByRole("button", { name: "Save" }).click()

	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajFieldMetadata/$ID/show"),
	)

	await expect(page.locator(".crud-content")).toContainText(tableName)
	await expect(page.locator(".crud-content")).toContainText('Field "testField"')
	await expect(page.locator(".crud-content")).toContainText("test_field")
	await expect(page.locator(".crud-content")).toContainText("short-text")
	await expect(page.locator(".crud-content")).toContainText(uuidInsideRegex)
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
})
