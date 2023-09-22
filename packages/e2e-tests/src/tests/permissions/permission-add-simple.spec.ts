import { expect } from "@playwright/test"
import { Role } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"

let role: Role

test.beforeEach(async ({ permissionPage }) => {
	role = await permissionPage.db.createRole()
})
test.afterEach(async ({ permissionPage }) => permissionPage.db.deleteRole(role.name))

test("Add permission", async ({ page, rolePage, permissionPage }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(role.id)

	await page.getByRole("tab", { name: "System" }).click()

	await page.getByRole("button", { name: "Download & Read Info" }).click()

	await page.getByRole("tab", { name: "Fields" }).click()

	await page.getByRole("button", { name: "Enable" }).click()
	await permissionPage.hasToast("Permissions successfully updated")

	const permissions = await permissionPage.db.getAllRolePermissions(role)
	expect(permissions).toHaveLength(1)

	expect(permissions[0]).toMatchObject({
		action: "read",
		resource: "zmaj.files",
		conditions: {},
		fields: null,
	})
})
