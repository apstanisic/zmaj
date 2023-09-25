import { test } from "../../setup/e2e-fixture.js"

test("Download single file", async ({ filePage, fileItem }) => {
	const name = fileItem.name

	await filePage.goHome()
	await filePage.goToListWithQuery({ filter: { name } })
	await filePage.clickOnFileName(name)
	await filePage.isOnFileShowPage(fileItem)
	await filePage.hasCrudContent(`Name: ${name}`)
	await filePage.clickOnDownloadButtonAndDownloadSingleFile()
	await filePage.isOnFileShowPage(fileItem)
})
