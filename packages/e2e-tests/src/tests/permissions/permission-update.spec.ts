import { expect } from "@playwright/test"
import { Permission, PermissionCreateDto, Role } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"

let permission: Permission
let role: Role

test.beforeEach(async ({ permissionPage }) => {
	role = await permissionPage.db.createRole()
	permission = await permissionPage.db.createPermission(
		new PermissionCreateDto({
			action: "create",
			resource: "collections.posts",
			roleId: role.id,
			conditions: { title: { $ne: "hello_world" } },
			fields: ["body", "title"],
		}),
	)
})

test.afterEach(async ({ permissionPage }) => permissionPage.db.deleteRole(role.name))

test("Update Permission", async ({ rolePage, permissionPage, page }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(role.id)

	await permissionPage.hasPartialPermissionsAmount(1)

	await permissionPage.openPermissionDialog(permission.action, permission.resource)
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
		const updated = await permissionPage.db.findPermission(permission.id)

		expect(updated).toMatchObject({
			fields: null,
			conditions: { title: "updated_title" },
		} satisfies Partial<typeof updated>)
	}).toPass()
})
