import { RelationCreateDto, RelationDef } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"

let relation: RelationDef

test.beforeEach(async ({ relationFx, relationFxData }) => {
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

test("Show Relation", async ({ relationPage, collectionPage, relationFxData, globalFx }) => {
	const [col1] = relationFxData.collections
	await globalFx.goToHomeUrl()
	await collectionPage.linkInSidebar.click()
	await collectionPage.collectionInList(col1).click()
	await collectionPage.relationsTab.click()
	await collectionPage.relationInListByDef(relation).click()

	await relationPage.isOnRelationShowPage(relation.id)
})
