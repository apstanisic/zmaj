import { expect, test } from "@playwright/test"
import { RelationDef, CollectionCreateDto, RelationCreateDto, throwErr } from "@zmaj-js/common"
import { deleteCollection } from "../utils/infra-test-helpers.js"
import { testSdk } from "../utils/test-sdk.js"

const leftTableName = "mtm_left_table_split"
const rightTableName = "mtm_right_table_split"
const junctionTableName = "mtm_junction_table_split"

let relation1: RelationDef

async function deleteTables(): Promise<void> {
	await deleteCollection(junctionTableName)
	await deleteCollection(leftTableName)
	await deleteCollection(rightTableName)
}

test.beforeEach(async () => {
	await deleteTables()

	await testSdk.infra.collections.createOne({
		data: new CollectionCreateDto({ tableName: leftTableName }),
	})
	await testSdk.infra.collections.createOne({
		data: new CollectionCreateDto({ tableName: rightTableName }),
	})
	// await testSdk.infra.collections.createOne({
	// 	data: new CollectionCreateDto({ tableName: junctionTableName }),
	// })

	relation1 = await testSdk.infra.relations.createOne({
		data: new RelationCreateDto({
			leftTable: leftTableName,
			rightTable: rightTableName,
			leftColumn: "id",
			rightColumn: "id",
			type: "many-to-many",
			leftPropertyName: "leftProp",
			rightPropertyName: "rightProp",
			junctionTable: junctionTableName,
		}),
	})
})

test.afterEach(async () => deleteTables())

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
	const leftRelation = await testSdk.infra.relations.getById({
		id: relation1.id ?? throwErr(),
	})
	expect(leftRelation.type).toEqual("one-to-many")
})
