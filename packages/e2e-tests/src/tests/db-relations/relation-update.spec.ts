import { expect } from "@playwright/test"
import { RelationCreateDto, RelationDef } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"

let relation: RelationDef

test.beforeEach(async ({ relationFxData, relationFx }) => {
	const [col1, col2] = relationFxData.collections
	relation = await relationFx.createRelation(
		new RelationCreateDto({
			leftCollection: col1.collectionName,
			rightCollection: col2.collectionName,
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
	)
})

test("Update relation", async ({
	page,
	relationPage,
	collectionPage,
	relationFxData,
	relationFx,
}) => {
	const [col1] = relationFxData.collections
	await relationPage.goHome()
	await collectionPage.goToList()
	await collectionPage.goToCollectionShow(col1)

	await page.getByRole("tab", { name: "Relations" }).click()

	await page.getByRole("link", { name: new RegExp(`${col1.tableName}.prop1`) }).click()
	await relationPage.toHaveUrl(`/zmajRelationMetadata/${relation.id}/show`)

	await relationPage.clickEditButton()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajRelationMetadata/${relation.id}`)

	await page.getByLabel("Property Name").fill("updatedProp")
	await page.getByLabel("Label").fill("Updated Label")
	await page.getByLabel("Template").fill("{id}")

	await relationPage.clickSaveButton()
	await relationPage.toHaveUrl(`/zmajRelationMetadata/${relation.id}/show`)

	const updatedRelation = await relationFx.findWhere({ id: relation.id })
	// const updatedRelation = await getSdk().infra.relations.getById({ id: relation.id })
	expect(updatedRelation).toMatchObject({
		id: relation.id,
		propertyName: "updatedProp",
		label: "Updated Label",
		template: "{id}",
	} satisfies Partial<typeof updatedRelation>)
})
