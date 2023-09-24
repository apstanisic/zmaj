import { expect } from "@playwright/test"
import { CollectionCreateDto, RelationCreateDto, RelationDef } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getRandomTableName } from "../../setup/e2e-unique-id.js"

const junctionName = getRandomTableName()

let relation1: RelationDef
let relation2: RelationDef

test.beforeEach(async ({ sdk, relationFxData }) => {
	const [col1, col2] = relationFxData.collections
	await sdk.infra.collections.createOne({
		data: new CollectionCreateDto({ tableName: junctionName, collectionName: junctionName }),
	})

	relation1 = await sdk.infra.relations.createOne({
		data: new RelationCreateDto({
			rightCollection: junctionName,
			leftCollection: col1.collectionName,
			left: { column: "id", propertyName: "propOuter" },
			right: { column: "left_id", propertyName: "propInner" },
			type: "one-to-many",
		}),
	})

	relation2 = await sdk.infra.relations.createOne({
		data: new RelationCreateDto({
			leftCollection: col2.collectionName,
			rightCollection: junctionName,
			left: { column: "id", propertyName: "propOuter2" },
			right: { column: "right_id", propertyName: "propInner2" },
			type: "one-to-many",
		}),
	})
})

test.afterEach(async ({ relationFx }) => relationFx.removeCollectionByTableName(junctionName))

test("Join relations to many-to-many", async ({
	relationPage,
	collectionPage,
	relationFxData,
	globalFx,
}) => {
	const [col1] = relationFxData.collections
	await globalFx.goToHomeUrl()
	await globalFx.sidebarLink("Collections").click()
	await collectionPage.collectionInList(col1.collectionName).click()

	await collectionPage.relationsTab.click()
	await collectionPage.relationInListByDef(relation1).click()

	await relationPage.joinMtmButton.click()
	await relationPage.confirmButton.click()

	await globalFx.expectAlertWithText("Successfully created M2M relation")

	await expect(relationPage.splitMtmButton).toBeInViewport()
})
