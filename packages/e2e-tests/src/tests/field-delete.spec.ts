import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollectionByTable } from "../utils/infra-test-helpers.js"
import { getSdk } from "../utils/test-sdk.js"
import { camel } from "radash"

const tableName = "field_test_delete_playwright"
const collectionName = camel(tableName)

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteCollectionByTable(tableName, sdk)
	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName, label: "Test345" },
	})
	await sdk.infra.fields.createOne({
		data: {
			columnName: "to_delete",
			dataType: "short-text",
			collectionName,
			isNullable: true,
			isUnique: false,
			dbDefaultValue: null,
		},
	})
})

test.afterEach(async () => deleteCollectionByTable(tableName))

test("Delete Field", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: tableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await page.getByRole("tab", { name: "Fields" }).click()
	await page.getByRole("link", { name: `Column: "to_delete"` }).click()

	await page.getByRole("button", { name: /Delete/ }).click()
	await page.getByRole("button", { name: "Confirm" }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await expect(page.locator(".crud-content")).toContainText(tableName)
	await expect(page.locator(".crud-content")).toContainText("auto-increment")
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
})
