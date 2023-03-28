import { expect, test } from "@playwright/test"
import { createIdRegex, uuidInsideRegex } from "../utils/create-id-regex.js"
import { deleteCollectionByTable } from "../utils/infra-test-helpers.js"
import { getSdk } from "../utils/test-sdk.js"
import { camel } from "radash"

const tableName = "field_test_create_playwright"
const collectionName = camel(tableName)

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteCollectionByTable(tableName, sdk)
	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName, label: "Test345", collectionName },
	})
})

test.afterEach(async () => deleteCollectionByTable(tableName))

test("Create Field", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: `Table: "${tableName}` }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	// click on fields
	await page.getByRole("tab", { name: "Fields" }).click()
	await page.getByRole("button", { name: "Add field" }).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajFieldMetadata/create?source={%22collectionName%22:%22fieldTestCreatePlaywright%22}`,
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
