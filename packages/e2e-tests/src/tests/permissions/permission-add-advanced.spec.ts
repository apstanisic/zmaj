import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"

test("Add permission with custom fields and conditions", async ({
	page,
	rolePage,
	permissionPage,
	zRole,
	permissionFx,
}) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(zRole.id)

	await page.getByRole("tab", { name: "System" }).click()

	await page.getByRole("button", { name: "Download & Read Info" }).click()

	await permissionPage.goToFieldsTab()

	await permissionPage.clickOnUnselectAll()

	await permissionPage.fieldCheckbox("id").check()
	await permissionPage.fieldCheckbox("name").check()
	await permissionPage.fieldCheckbox("mimeType").check()
	await permissionPage.fieldCheckbox("description").check()

	await permissionPage.goToConditionsTab()

	await page.getByText("{}").click()
	await page.keyboard.press("Backspace")
	await page.keyboard.press("Backspace")
	// await page.getByLabel("Conditions").click()

	const toType = {
		fileSize: {
			$gte: 1000,
		},
	}
	await page.keyboard.type(JSON.stringify(toType))

	await permissionPage.clickOnEnableButton()
	await permissionPage.permissionUpdatedToast()

	const permission = await permissionFx.repo.findOne({
		where: {
			action: "read",
			resource: "zmaj.files",
		},
	})
	expect(permission).toMatchObject({
		action: "read",
		resource: "zmaj.files",
		conditions: toType,
		fields: expect.arrayContaining(["id", "name", "mimeType", "description"]),
	})
})
