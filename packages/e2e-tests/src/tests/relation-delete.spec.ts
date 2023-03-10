import { expect, test } from "@playwright/test"
import { RelationCreateDto } from "@zmaj-js/common"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollection } from "../utils/infra-test-helpers.js"
import { testSdk } from "../utils/test-sdk.js"

const leftTableName = "test_rel_delete_left"
const rightTableName = "test_rel_delete_right"

test.beforeEach(async () => {
	await deleteCollection(leftTableName)
	await deleteCollection(rightTableName)

	await testSdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName: leftTableName },
	})
	await testSdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName: rightTableName },
	})

	await testSdk.infra.relations.createOne({
		data: new RelationCreateDto({
			leftColumn: "ref_id",
			leftTable: leftTableName,
			rightTable: rightTableName,
			rightColumn: "id",
			type: "many-to-one",
			leftPropertyName: "prop1",
			rightPropertyName: "prop2",
		}),
	})
})

test.afterEach(async () => {
	await deleteCollection(leftTableName)
	await deleteCollection(rightTableName)
})

test("Delete Relation", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: leftTableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await page.getByRole("tab", { name: "Relations" }).click()

	await page.getByText(`${leftTableName}.prop1 <-> ${rightTableName}`).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajRelationMetadata/$ID/show"),
	)

	await page.getByRole("button", { name: /Delete/ }).click()
	await page.getByText("Confirm").click()

	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await expect(page.locator(".crud-content")).toContainText(leftTableName)
	await expect(page.locator(".crud-content")).toContainText("auto-increment")
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
})
