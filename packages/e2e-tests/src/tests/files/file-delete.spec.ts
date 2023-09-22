import { faker } from "@faker-js/faker"
import { test } from "../../setup/e2e-fixture.js"

const assetPath = "test-image-delete.png"
const imgName = faker.system.commonFileName("png")

test.beforeEach(async ({ filePage }) => filePage.uploadFile(assetPath, imgName))
test.afterEach(async ({ filePage }) => filePage.db.deleteFileByName(imgName))

test("Delete single file", async ({ filePage }) => {
	await filePage.goHome()
	await filePage.goToListWithQuery({ filter: { name: imgName } })
	await filePage.clickOnFileName(imgName)
	await filePage.isOnFileShowPage(imgName)
	await filePage.clickDeleteButton()
	await filePage.clickConfirmButton()
	await filePage.isOnListPage()
	await filePage.elementDeletedVisible()
})
