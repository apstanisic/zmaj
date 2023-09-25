import { test } from "../../setup/e2e-fixture.js"

test("Show Collection", async ({ collectionPage, collectionItem }) => {
	await collectionPage.goHome()
	await collectionPage.goToList()
	await collectionPage.goToCollectionShow(collectionItem)

	await collectionPage.hasCrudContent(collectionItem.id) // id
	await collectionPage.hasCrudContent("uuid") // pk type
	await collectionPage.hasCrudContent(collectionItem.tableName) // table name
})
