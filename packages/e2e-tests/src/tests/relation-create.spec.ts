import { expect, test } from "@playwright/test"
import { camel } from "radash"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteTables } from "../utils/deleteTable.js"
import { getSdk } from "../utils/getSdk.js"

const leftTableName = "test_rel_create_left"
const rightTableName = "test_rel_create_right"

const leftCollectionName = camel(leftTableName)
const rightCollectionName = camel(rightTableName)

let leftCollectionId: string

test.beforeEach(async () => {
	await deleteTables(leftTableName, rightTableName)

	const sdk = getSdk()

	const leftCollection = await sdk.infra.collections.createOne({
		data: {
			pkColumn: "id",
			pkType: "auto-increment",
			tableName: leftTableName,
			collectionName: leftCollectionName,
		},
	})
	leftCollectionId = leftCollection.id

	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName: rightTableName },
	})
})

test.afterEach(async () => {
	await deleteTables(leftTableName, rightTableName)
})

test("Create many-to-one relation", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: leftTableName }).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajCollectionMetadata/${leftCollectionId}/show`,
	)

	await page.getByRole("tab", { name: "Relations" }).click()
	await page.getByRole("button", { name: "Add relation" }).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajRelationMetadata/create?disable_leftCollection=true&source={%22leftCollection%22:%22${leftCollectionName}%22}`,
	)

	await page.getByRole("button", { name: /Type/ }).click()
	await page.getByRole("option", { name: /Many to One/ }).click()
	// await page.getByRole("button", { name: ">-- Many to One ▼" }).click()
	// await page.getByRole("option", { name: ">-- Many to One" }).getByText(">-- Many to One").click()

	// await page.getByRole("button", { name: ">-- Many to One ▼" }).press("Tab")

	await page.getByRole("button", { name: /Collection \(other side\)/ }).click()
	await page.getByRole("option", { name: rightCollectionName }).click()
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
