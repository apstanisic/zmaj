import { expect, test } from "@playwright/test"
import { RelationCreateDto } from "@zmaj-js/common"
import { camel } from "radash"
import { getRandomTableName } from "../setup/e2e-unique-id.js"
import { deleteTables } from "../utils/e2e-delete-tables.js"
import { getSdk } from "../utils/e2e-get-sdk.js"

const leftTableName = getRandomTableName()
const rightTableName = getRandomTableName()

let leftCollectionId: string
let relationId: string

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteTables(leftTableName, rightTableName)

	const col1 = await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName: leftTableName },
	})
	leftCollectionId = col1.id

	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName: rightTableName },
	})

	const relation = await sdk.infra.relations.createOne({
		data: new RelationCreateDto({
			leftCollection: camel(leftTableName),
			rightCollection: camel(rightTableName),
			left: {
				column: "ref_id",
				propertyName: "prop1",
			},
			right: {
				column: "id",
				propertyName: "prop2",
			},
			type: "many-to-one",
		}),
	})
	relationId = relation.id
})

test.afterEach(async () => {
	await deleteTables(leftTableName, rightTableName)
})

test("Delete Relation", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: `Table: "${leftTableName}"` }).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajCollectionMetadata/${leftCollectionId}/show`,
	)

	await page.getByRole("tab", { name: "Relations" }).click()

	await page.getByText(`${leftTableName}.prop1 ⟶ ${rightTableName}`).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajRelationMetadata/${relationId}/show`,
	)

	await page.getByRole("button", { name: /Delete/ }).click()
	await page.getByText("Confirm").click()

	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajCollectionMetadata/${leftCollectionId}/show`,
	)

	await expect(page.locator(".crud-content")).toContainText(leftTableName)
	await expect(page.locator(".crud-content")).toContainText("auto-increment")
	// Delete button
	await expect(page.locator(".crud-content")).toContainText("Delete")
})
