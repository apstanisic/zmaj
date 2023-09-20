import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteTables } from "../utils/e2e-delete-tables.js"
import { getSdk } from "../utils/e2e-get-sdk.js"

const tableName = "test_delete_playwright"

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteTables(tableName)
	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName },
	})
})
test.afterEach(async () => deleteTables(tableName))

test("Delete Collection", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: tableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await page.getByRole("button", { name: /Delete/ }).click()
	await page.getByText("Confirm").click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")
})
