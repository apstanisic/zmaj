import { faker } from "@faker-js/faker"
import { test } from "../../setup/e2e-fixture.js"

const imgName1 = faker.system.commonFileName("png")
const imgName2 = faker.system.commonFileName("png")

test.afterEach(async ({ fileFx }) => {
	await fileFx.deleteFileByName(imgName1)
	await fileFx.deleteFileByName(imgName2)
})

test("Upload multiple files", async ({ filePage }) => {
	await filePage.goHome()
	await filePage.goToList()
	await filePage.clickUploadButton()

	const picker = await filePage.openFilePicker()

	await picker.setFiles([
		await filePage.readAsset("test-image-multiple-1.png", imgName1),
		await filePage.readAsset("test-image-multiple-1.png", imgName2),
	])

	// hide upload dialog since it remains open, if user wants to upload multiple files.
	// maybe close by default?
	await filePage.pressEscape()

	await filePage.uploadSuccessToast()

	await filePage.isShowingFileName(imgName1)
	await filePage.isShowingFileName(imgName2)
})
