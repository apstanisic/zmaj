import { faker } from "@faker-js/faker"
import { test } from "../../setup/e2e-fixture.js"

const assetPath = "test-image-show.png"
const imgName = faker.system.commonFileName("png")

test.beforeEach(async ({ filePage, request }) => {
	// await uploadTestFile({ assetsPath: assetPath, customName: imgName, request })
	await filePage.uploadFile(assetPath, imgName)
})
test.afterEach(async ({ filePage }) => filePage.db.deleteFileByName(imgName))

test("Display file", async ({ filePage }) => {
	await filePage.goHome()
	await filePage.goToList()
	await filePage.clickOnFileName(imgName)
	await filePage.isOnFileShowPage(imgName)
	await filePage.hasCrudContent(`Name: ${imgName}`)
	await filePage.hasCrudContent("Storage provider: default")
	await filePage.hasCrudContent("Mime Type: image/png")
	await filePage.hasCrudContent("Size: 3kb")
	await filePage.itShouldContainImagesAmount(1)
})
