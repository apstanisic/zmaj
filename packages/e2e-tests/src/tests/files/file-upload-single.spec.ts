import { faker } from "@faker-js/faker"
import { test } from "../../setup/e2e-fixture.js"

const imgName = faker.system.commonFileName("png")

test.afterEach(async ({ fileFx }) => fileFx.deleteWhere({ name: imgName }))

test("Upload single file", async ({ filePage }) => {
	await filePage.goHome()
	await filePage.goToList()
	await filePage.clickUploadButton()

	const filePicker = await filePage.openFilePicker()
	await filePicker.setFiles(await filePage.readAsset("test-image-single.png", imgName))

	// hide upload dialog since it remains open, if user wants to upload multiple files.
	// maybe close by default?
	await filePage.pressEscape()

	await filePage.uploadSuccessToast()
	await filePage.isShowingFileName(imgName)
})
