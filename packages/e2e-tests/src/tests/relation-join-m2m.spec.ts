import { expect, test } from "@playwright/test"
import { RelationDef, CollectionCreateDto, RelationCreateDto, throwErr } from "@zmaj-js/common"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollectionByTable } from "../utils/infra-test-helpers.js"
import { getSdk } from "../utils/test-sdk.js"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { camel } from "radash"

const leftTableName = "mtm_left_table_join"
const rightTableName = "mtm_right_table_join"
const junctionTableName = "mtm_junction_table"

let relation1: RelationDef
let relation2: RelationDef

async function deleteTables(sdk: ZmajSdk): Promise<void> {
	await deleteCollectionByTable(junctionTableName, sdk)
	await deleteCollectionByTable(leftTableName, sdk)
	await deleteCollectionByTable(rightTableName, sdk)
}

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteTables(sdk)

	await sdk.infra.collections.createOne({
		data: new CollectionCreateDto({ tableName: leftTableName }),
	})
	await sdk.infra.collections.createOne({
		data: new CollectionCreateDto({ tableName: rightTableName }),
	})
	await sdk.infra.collections.createOne({
		data: new CollectionCreateDto({ tableName: junctionTableName }),
	})

	relation1 = await sdk.infra.relations.createOne({
		data: new RelationCreateDto({
			leftCollection: camel(junctionTableName),
			rightCollection: camel(leftTableName),
			left: { column: "left_id", propertyName: "propInner" },
			right: { column: "id", propertyName: "propOuter" },
			type: "many-to-one",
		}),
	})

	relation2 = await sdk.infra.relations.createOne({
		data: new RelationCreateDto({
			leftCollection: camel(junctionTableName),
			rightCollection: camel(rightTableName),
			left: { column: "right_id", propertyName: "propInner2" },
			right: { column: "id", propertyName: "propOuter2" },
			type: "many-to-one",
		}),
	})
})

test.afterEach(async () => deleteTables(getSdk()))

test("Join relations to many-to-many", async ({ page }) => {
	if (!relation1 || !relation2) throwErr()

	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: leftTableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await page.getByRole("tab", { name: "Relations" }).click()

	await page.getByRole("link", { name: /mtm_left_table_join.propOuter/ }).click()
	// await expect(page).toHaveURL(
	// 	`http://localhost:7100/admin/#/zmajRelationMetadata/${relation1.rightRelationId}/show`,
	// )

	await page.getByRole("button", { name: "Join M2M" }).click()

	// await page.getByText("mtm_left_table_join - mtm_junction_table - mtm_right_table_join").click()

	await page.getByRole("button", { name: "Confirm" }).click()

	await expect(page.getByText("Successfully created M2M relation")).toHaveCount(1)
	//
	// const cols = testSdk.infra.collections.getMany({
	// 	f
	// })
	const allState = await getSdk().infra.getCollections()

	const leftCol = allState.find((c) => c.tableName === relation1.otherSide.tableName)
	const leftMtmValid = Object.values(leftCol?.relations ?? {}).find(
		(r) => r.type === "many-to-many" && r.relation.fkName === relation1.relation.fkName,
	)
	expect(leftMtmValid).toBeDefined()

	const rightCol = allState.find((c) => c.tableName === relation2.otherSide.tableName)
	const rightMtmValid = Object.values(rightCol?.relations ?? {}).find(
		(r) => r.type === "many-to-many" && r.relation.fkName === relation2.relation.fkName,
	)
	expect(rightMtmValid).toBeDefined()

	// const leftRelation = await testSdk.infra.relations.getById({
	// 	id: relation1.rightRelationId ?? throwErr(),
	// })
	// const rightRelation = await testSdk.infra.relations.getById({
	// 	id: relation2.rightRelationId ?? throwErr(),
	// })
	// expect(leftRelation.type).toEqual("many-to-many")
	// expect(rightRelation.type).toEqual("many-to-many")
})
