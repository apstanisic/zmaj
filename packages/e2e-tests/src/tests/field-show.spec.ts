import { expect, test } from "@playwright/test"
import { FieldCreateDto } from "@zmaj-js/common"
import { camel } from "radash"
import { getRandomTableName } from "../setup/e2e-unique-id.js"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteTables } from "../utils/deleteTable.js"
import { getSdk } from "../utils/getSdk.js"

const tableName = getRandomTableName()
const collectionName = camel(tableName)

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteTables(tableName)
	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName, label: "Test345", collectionName },
	})
	await sdk.infra.fields.createOne({
		data: new FieldCreateDto({
			columnName: "to_show",
			dataType: "text",
			collectionName,
			isNullable: true,
			isUnique: false,
			dbDefaultValue: null,
		}),
	})
})

test.afterEach(async () => deleteTables(tableName))

test("Show Field", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: tableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await page.getByRole("tab", { name: "Fields" }).click()
	await page.getByRole("link", { name: `Column: "to_show"` }).click()

	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajFieldMetadata/$ID/show"),
	)

	await expect(page.locator(".crud-content")).toContainText(tableName)
	await expect(page.locator(".crud-content")).toContainText('Field "toShow"')
	await expect(page.locator(".crud-content")).toContainText("to_show")
	await expect(page.locator(".crud-content")).toContainText("text")
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
})
