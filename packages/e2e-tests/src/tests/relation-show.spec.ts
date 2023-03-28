import { expect, test } from "@playwright/test"
import { RelationCreateDto } from "@zmaj-js/common"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollectionByTable } from "../utils/infra-test-helpers.js"
import { getSdk } from "../utils/test-sdk.js"
import { camel } from "radash"

const leftTableName = "test_rel_show_left"
const rightTableName = "test_rel_show_right"

let leftCollectionId: string
let relationId: string

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteCollectionByTable(leftTableName, sdk)
	await deleteCollectionByTable(rightTableName, sdk)

	const col1 = await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName: leftTableName },
	})
	leftCollectionId = col1.id

	const col2 = await sdk.infra.collections.createOne({
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
	const sdk = getSdk()
	await deleteCollectionByTable(leftTableName, sdk)
	await deleteCollectionByTable(rightTableName, sdk)
})

test("Show Relation", async ({ page }) => {
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
})
