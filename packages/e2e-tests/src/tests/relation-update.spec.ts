import { expect, test } from "@playwright/test"
import { RelationMetadata, RelationCreateDto, RelationDef, throwErr } from "@zmaj-js/common"
import { deleteCollection } from "../utils/infra-test-helpers.js"
import { getSdk } from "../utils/test-sdk.js"

const leftTableName = "test_rel_update_left"
const rightTableName = "test_rel_update_right"

let relation: RelationDef

test.beforeEach(async () => {
	const sdk = getSdk()
	await deleteCollection(leftTableName, sdk)
	await deleteCollection(rightTableName, sdk)

	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName: leftTableName },
	})
	await sdk.infra.collections.createOne({
		data: { pkColumn: "id", pkType: "auto-increment", tableName: rightTableName },
	})

	relation = await sdk.infra.relations.createOne({
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

test("Update relation", async ({ page }) => {
	if (!relation) throwErr()

	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: "test_rel_update_left" }).click()
	// await expect(page).toHaveURL(
	// 	`http://localhost:7100/admin/#/zmajCollectionMetadata/${relation.collectionId}/show`,
	// )

	await page.getByRole("tab", { name: "Relations" }).click()

	await page.getByRole("link", { name: /test_rel_update_left\.prop1/ }).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajRelationMetadata/${relation.id}/show`,
	)

	await page.getByRole("button", { name: /Edit/ }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajRelationMetadata/${relation.id}`)

	await page.getByLabel("Property Name").fill("updatedProp")
	await page.getByLabel("Label").fill("Updated Label")
	await page.getByLabel("Template").fill("{id}")

	await page.getByRole("button", { name: "Save" }).click()
	await expect(page).toHaveURL(
		`http://localhost:7100/admin/#/zmajRelationMetadata/${relation.id}/show`,
	)

	// await expect(page.getByRole("alert", { name: /Element updated/ })).toBeVisible()

	const updatedRelation = await getSdk().infra.relations.getById({ id: relation.id })
	expect(updatedRelation.relation).toMatchObject({
		id: relation.id,
		propertyName: "updatedProp",
		label: "Updated Label",
		template: "{id}",
	} satisfies Partial<RelationMetadata>)
})
