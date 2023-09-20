import { expect, test } from "@playwright/test"
import { camel } from "radash"
import { getRandomTableName } from "../setup/e2e-unique-id.js"
import { createIdRegex, uuidInsideRegex } from "../utils/create-id-regex.js"
import { deleteTables } from "../utils/e2e-delete-tables.js"
import { getSdk } from "../utils/e2e-get-sdk.js"

const tableName = getRandomTableName()
const collectionName = camel(tableName)

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteTables(tableName)
	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName, label: "Test345", collectionName },
	})
})

test.afterEach(async () => deleteTables(tableName))

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
	await expect(page.locator(".crud-content")).toContainText("text")
	await expect(page.locator(".crud-content")).toContainText(uuidInsideRegex)
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
})
