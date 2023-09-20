import { expect, test } from "@playwright/test"
import { createIdRegex, uuidInsideRegex } from "../utils/create-id-regex.js"
import { getSdk } from "../utils/e2e-get-sdk.js"

async function deleteCollection(): Promise<void> {
	const sdk = getSdk()
	const cols = await sdk.infra.getCollections()
	const toDelete = cols.find((c) => c.tableName === "playwright_test_posts")
	if (!toDelete) return

	await sdk.infra.collections.deleteById({ id: toDelete.id })
}

test.beforeEach(async () => deleteCollection())
test.afterEach(async () => deleteCollection())

test("Create Collection", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("button", { name: /Create/ }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata/create")

	await page.getByLabel("Table Name").fill("playwright_test_posts")

	await page.getByRole("button", { name: "Next" }).click()

	await page.getByLabel("Label").fill("E2E Posts")

	await page.getByRole("button", { name: "Save" }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await expect(page.locator(".app-sidebar")).toContainText("E2E Posts")
	await expect(page.locator(".crud-content")).toContainText("playwright_test_posts")
	await expect(page.locator(".crud-content")).toContainText("E2E Posts")
	await expect(page.locator(".crud-content")).toContainText(uuidInsideRegex)
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
})
