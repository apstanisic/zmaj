import { faker } from "@faker-js/faker"
import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"

const assetPath1 = "test-image-download-multiple-1.png"
const assetPath2 = "test-image-download-multiple-2.png"
const imgName1 = faker.system.commonFileName("png")
const imgName2 = faker.system.commonFileName("png")

test.beforeEach(async ({ filePage }) => {
	await filePage.uploadFile(assetPath1, imgName1)
	await filePage.uploadFile(assetPath2, imgName2)
})
test.afterEach(async ({ filePage }) => {
	await filePage.db.deleteFileByName(imgName1)
	await filePage.db.deleteFileByName(imgName2)
})

test("Download multiple files", async ({ page, filePage }) => {
	await filePage.goHome()
	// This will display just those 2 files
	await filePage.goToListWithQuery({ filter: { name: { $in: [imgName1, imgName2] } } })

	await filePage.selectNthFileInList(0)
	await filePage.selectNthFileInList(1)

	// we expect 2 downloads, so we can't simply react to event (i think??)
	const downloadCounter = filePage.startCountingDownloads()
	filePage.clickOnDownloadButton()

	await expect(() => {
		expect(downloadCounter()).toEqual(2)
	}).toPass()
})
