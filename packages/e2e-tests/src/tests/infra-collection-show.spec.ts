import { expect, test } from "@playwright/test"
import { getRandomTableName } from "../setup/e2e-unique-id.js"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteTables } from "../utils/e2e-delete-tables.js"
import { getSdk } from "../utils/e2e-get-sdk.js"

const tableName = getRandomTableName()

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteTables(tableName)
	await sdk.infra.collections
		.createOne({
			data: { pkColumn: "id", pkType: "auto-increment", tableName, label: "Test345" },
		})
		.catch((e2) => {
			console.log({ e2 })
			throw e2
		})
})

test.afterEach(async () => deleteTables(tableName))

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
