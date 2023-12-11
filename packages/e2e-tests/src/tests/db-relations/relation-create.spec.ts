import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"
import { createIdRegex } from "../../utils/create-id-regex.js"

test("Create many-to-one relation", async ({
	page,
	relationFxData,
	relationPage,
	collectionPage,
	globalFx,
}) => {
	const [col1, col2] = relationFxData.collections
	await globalFx.goToHomeUrl()
	await collectionPage.linkInSidebar.click()
	await collectionPage.collectionInList(col1).click()
	await collectionPage.relationsTab.click()

	await collectionPage.addRelationButton.click()
	await relationPage.toHaveUrl(
		`zmajRelationMetadata/create?disable_leftCollection=true&source={%22leftCollection%22:%22${col1.collectionName}%22}`,
	)

	await page.getByLabel("Relation type").click()
	await page.getByRole("option", { name: /Many to One/ }).click()

	await page.getByRole("button", { name: /Collection \(other side\)/ }).click()
	await page.getByRole("option", { name: col2.collectionName }).click()
	// await page.keyboard.press("Enter")
	// await page.getByRole("option", { name: rightTableName }).getByText(rightTableName).click()

	await page.getByLabel("Property").nth(0).fill("leftProp")
	await page.getByLabel("Property (other side)").fill("rightProp")

	await page.getByLabel("Database Column").first().fill("ref_id")
	await page.getByRole("button", { name: "Show advanced" }).click()

	await page.getByLabel("Label").nth(0).fill("LeftSideLabel")
	await page.getByLabel("Label (other side)").fill("RightSideLabel")

	await page.getByLabel("Foreign Key Name").fill("uniq_foreign_key_test_update")

	await page.getByRole("button", { name: "Save" }).click()

	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajRelationMetadata/$ID/show"),
	)
	await relationPage.hasCrudContent(col1.tableName)
	await relationPage.hasCrudContent(col2.tableName)
	await relationPage.hasCrudContent("many-to-one")
	await relationPage.hasCrudContent("ref_id")
	await relationPage.hasCrudContent("leftProp")
	// await relationPage.hasCrudContent("rightProp")
	// await relationPage.hasCrudContent("RightCol")
	await relationPage.hasCrudContent("LeftSideLabel")
	// Delete button
	await relationPage.hasCrudContent("Delete")
})
