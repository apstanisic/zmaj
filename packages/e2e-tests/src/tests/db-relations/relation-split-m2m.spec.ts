import { expect } from "@playwright/test"
import { RelationCreateDto, RelationDef, throwErr } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getRandomTableName } from "../../setup/e2e-unique-id.js"

const junctionTableName = getRandomTableName()

let relation1: RelationDef

test.beforeEach(async ({ relationFxData, sdk }) => {
	const [col1, col2] = relationFxData.collections

	relation1 = await sdk.infra.relations.createOne({
		data: new RelationCreateDto({
			leftCollection: col1.collectionName,
			rightCollection: col2.collectionName,
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

test.afterEach(async ({ collectionFx }) =>
	collectionFx.deleteCollectionByTableName(junctionTableName),
)

test("Split many to many relation", async ({ page, relationFxData, sdk, collectionPage }) => {
	const [col1, col2] = relationFxData.collections

	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: col1.tableName }).click()
	// await expect(page).toHaveURL(
	// 	`http://localhost:7100/admin/#/zmajCollectionMetadata/${relation1.collectionId}/show`,
	// )

	await page.getByRole("tab", { name: "Relations" }).click()

	await collectionPage.relationInListByDef(relation1).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajRelationMetadata/${relation1.id}/show`,
	)

	await page.getByRole("button", { name: "Split M2M" }).click()

	await page.getByRole("button", { name: "Confirm" }).click()

	await expect(page.getByText("Successfully splitted relation")).toHaveCount(1)

	//
	const leftRelation = await sdk.infra.relations.getById({
		id: relation1.id ?? throwErr(),
	})
	expect(leftRelation.type).toEqual("one-to-many")
})
