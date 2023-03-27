import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollectionByTable } from "../utils/infra-test-helpers.js"
import { getSdk } from "../utils/test-sdk.js"

const leftTableName = "test_rel_create_left"
const rightTableName = "test_rel_create_right"

test.beforeEach(async () => {
	await deleteCollectionByTable(leftTableName)
	await deleteCollectionByTable(rightTableName)

	const sdk = getSdk()

	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName: leftTableName },
	})
	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName: rightTableName },
	})
})

test.afterEach(async () => {
	const sdk = getSdk()
	await deleteCollectionByTable(leftTableName, sdk)
	await deleteCollectionByTable(rightTableName, sdk)
})

test("Create many-to-one relation", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: leftTableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await page.getByRole("tab", { name: "Relations" }).click()
	await page.getByRole("button", { name: "Add relation" }).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajRelationMetadata/create?disable_leftTable=true&source={%22leftTable%22:%22${leftTableName}%22}`,
	)

	await page.getByRole("button", { name: /Type/ }).click()
	await page.getByRole("option", { name: /Many to One/ }).click()
	// await page.getByRole("button", { name: ">-- Many to One ▼" }).click()
	// await page.getByRole("option", { name: ">-- Many to One" }).getByText(">-- Many to One").click()

	// await page.getByRole("button", { name: ">-- Many to One ▼" }).press("Tab")

	await page.getByRole("button", { name: /Table \(other side\)/ }).click()
	await page.getByRole("option", { name: rightTableName }).click()
	// await page.keyboard.press("Enter")
	// await page.getByRole("option", { name: rightTableName }).getByText(rightTableName).click()

	await page.getByLabel("Property").nth(0).fill("leftProp")
	await page.getByLabel("Property (other side)").fill("rightProp")

	await page.getByLabel("Database Column").first().fill("ref_id")
	await page.getByRole("button", { name: "Show advanced" }).click()

	await page.getByLabel("Label").nth(0).fill("LeftSideLabel")
	await page.getByLabel("Label (other side)").fill("RightSideLabel")

	await page.getByLabel("Foreign Key Name").fill("uniq_foreign_key_test_update")

	await page.getByRole("button", { name: "Save" }).click()

	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajRelationMetadata/$ID/show"),
	)
	await expect(page.locator(".crud-content")).toContainText(leftTableName)
	await expect(page.locator(".crud-content")).toContainText(rightTableName)
	await expect(page.locator(".crud-content")).toContainText("many-to-one")
	await expect(page.locator(".crud-content")).toContainText("ref_id")
	await expect(page.locator(".crud-content")).toContainText("leftProp")
	// await expect(page.locator(".crud-content")).toContainText("rightProp")
	// await expect(page.locator(".crud-content")).toContainText("RightCol")
	await expect(page.locator(".crud-content")).toContainText("LeftSideLabel")
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
})
