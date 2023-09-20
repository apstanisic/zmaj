import { expect, test } from "@playwright/test"
import { CollectionCreateDto, RelationCreateDto, RelationDef, throwErr } from "@zmaj-js/common"
import { camel } from "radash"
import { deleteTables } from "../utils/deleteTable.js"
import { getSdk } from "../utils/getSdk.js"

const leftTableName = "mtm_left_table_split"
const rightTableName = "mtm_right_table_split"
const junctionTableName = "mtm_junction_table_split"

let relation1: RelationDef

async function deleteThisTables(): Promise<void> {
	await deleteTables(junctionTableName, leftTableName, rightTableName)
}

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteThisTables()

	await sdk.infra.collections.createOne({
		data: new CollectionCreateDto({ tableName: leftTableName }),
	})
	await sdk.infra.collections.createOne({
		data: new CollectionCreateDto({ tableName: rightTableName }),
	})

	relation1 = await sdk.infra.relations.createOne({
		data: new RelationCreateDto({
			leftCollection: camel(leftTableName),
			rightCollection: camel(rightTableName),
			left: {
				column: "id",
				propertyName: "leftProp",
			},
			right: {
				column: "id",
				propertyName: "rightProp",
			},
			type: "many-to-many",
			junction: {
				tableName: junctionTableName,
			},
		}),
	})
})

test.afterEach(async () => deleteThisTables())

test("Split many to many relation", async ({ page }) => {
	if (!relation1) throwErr()

	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: leftTableName }).click()
	// await expect(page).toHaveURL(
	// 	`http://localhost:7100/admin/#/zmajCollectionMetadata/${relation1.collectionId}/show`,
	// )

	await page.getByRole("tab", { name: "Relations" }).click()

	await page.getByRole("link", { name: /mtm_left_table_split.leftProp/ }).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajRelationMetadata/${relation1.id}/show`,
	)

	await page.getByRole("button", { name: "Split M2M" }).click()

	await page.getByRole("button", { name: "Confirm" }).click()

	await expect(page.getByText("Successfully splitted relation")).toHaveCount(1)

	//
	const leftRelation = await getSdk().infra.relations.getById({
		id: relation1.id ?? throwErr(),
	})
	expect(leftRelation.type).toEqual("one-to-many")
})
