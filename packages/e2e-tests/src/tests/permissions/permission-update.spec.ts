import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"

test.beforeEach(async ({ permissionItem, permissionFx }) => {
	const updated = await permissionFx.update(permissionItem.id, {
		conditions: { title: { $ne: "hello_world" } },
		fields: ["body", "title"],
	})
	Object.assign(permissionItem, updated)
})

test("Update Permission", async ({
	rolePage,
	permissionPage,
	page,
	zRole,
	permissionFx,
	permissionItem,
}) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(zRole.id)

	await permissionPage.hasPartialPermissionsAmount(1)

	await permissionPage.openPermissionDialog(permissionItem.action, permissionItem.resource)
	await permissionPage.goToFieldsTab()
	await permissionPage.clickOnSelectAll()

	await permissionPage.goToConditionsTab()

	await page.getByText(/"hello_world"/).click()
	await page.keyboard.press("Control+a")
	await page.keyboard.press("Delete")

	await page.keyboard.type(JSON.stringify({ title: "updated_title" }))

	await permissionPage.clickOnChangeButton()

	await permissionPage.hasToast("Permissions successfully updated")

	expect(async () => {
		const updated = await permissionFx.findPermission(permissionItem.id)
		expect(updated).toMatchObject({
			fields: null,
			conditions: { title: "updated_title" },
		} satisfies Partial<typeof updated>)
	}).toPass()
})
