import { faker } from "@faker-js/faker"
import { test } from "../../setup/e2e-fixture.js"

const asset = "test-image-update.png"
const imgName = faker.system.commonFileName("png")

test.beforeEach(async ({ filePage }) => {
	await filePage.uploadFile(asset, imgName)
})

test.afterEach(async ({ filePage }) => filePage.db.deleteFileByName(imgName))

test("Update file", async ({ page, filePage }) => {
	await filePage.goHome()
	await filePage.goToList()
	await filePage.goToListWithQuery({ filter: { name: imgName } })
	await filePage.clickOnFileName(imgName)
	await filePage.isOnFileShowPage(imgName)
	await filePage.notHasCrudContent(`Description: This is description`)

	await filePage.clickEditButton()
	await filePage.isOnFileEditPage(imgName)
	await page.getByLabel("Description").fill("This is description")
	await filePage.clickSaveButton()

	await filePage.isOnFileShowPage(imgName)

	await filePage.hasCrudContent(`Name: ${imgName}`)
	await filePage.hasCrudContent(`Description: This is description`)
})
