import { test } from "../../setup/e2e-fixture.js"

test("Display file", async ({ filePage, fileItem }) => {
	const name = fileItem.name

	await filePage.goHome()
	await filePage.goToList()
	await filePage.clickOnFileName(name)
	await filePage.isOnFileShowPage(fileItem)
	await filePage.hasCrudContent(`Name: ${name}`)
	// await filePage.hasCrudContent("Storage provider: default")
	await filePage.hasCrudContent(`Mime Type: ${fileItem.mimeType}`)
	await filePage.hasCrudContent("Size: 30kb")
	await filePage.itShouldContainImagesAmount(1)
})
