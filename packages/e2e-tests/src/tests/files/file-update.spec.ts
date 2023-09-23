import { test } from "../../setup/e2e-fixture.js"

test("Update file", async ({ page, filePage, fileItem }) => {
	const name = fileItem.name

	await filePage.goHome()
	await filePage.goToList()
	await filePage.goToListWithQuery({ filter: { name } })
	await filePage.clickOnFileName(name)
	await filePage.isOnFileShowPage(fileItem)
	await filePage.notHasCrudContent(`Description: This is description`)

	await filePage.clickEditButton()
	await filePage.isOnFileEditPage(fileItem)
	await page.getByLabel("Description").fill("This is description")
	await filePage.clickSaveButton()

	await filePage.isOnFileShowPage(fileItem)

	await filePage.hasCrudContent(`Name: ${name}`)
	await filePage.hasCrudContent(`Description: This is description`)
})
