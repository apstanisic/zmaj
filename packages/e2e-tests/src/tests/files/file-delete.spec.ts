import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"
import { createIdRegex } from "../../utils/create-id-regex.js"
import { uploadTestFile } from "../../utils/e2e-file-utils.js"
import { toRaQuery } from "../../utils/test-sdk.js"

const img = "test-image-delete.png"
const imgName = "test-image-delete"

test.beforeEach(async ({ request }) =>
	uploadTestFile({ request, assetsPath: img, customName: imgName }),
)
test.afterEach(async ({ filePage }) => filePage.db.deleteFileByName(imgName))

test("Delete single file", async ({ filePage, page }) => {
	await filePage.goHome()

	await filePage.clickLink("Files")

	// await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	const query = toRaQuery({ filter: { name: imgName } })
	await page.goto(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	await page.getByText(imgName).click()
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajFiles/$ID/show"))
	await filePage.clickDeleteButton()
	await filePage.clickConfirmButton()
	await filePage.isOnRootPage()
	await filePage.hasBodyContent("Element deleted")
})
