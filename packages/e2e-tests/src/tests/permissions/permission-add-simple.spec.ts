import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"

test("Add permission", async ({ page, rolePage, permissionPage, zRole, permissionFx }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(zRole.id)

	await page.getByRole("tab", { name: "System" }).click()

	await page.getByRole("button", { name: "Download & Read Info" }).click()

	await page.getByRole("tab", { name: "Fields" }).click()

	await page.getByRole("button", { name: "Enable" }).click()
	await permissionPage.hasToast("Permissions successfully updated")

	const permissions = await permissionFx.getAllRolePermissions(zRole)
	expect(permissions).toHaveLength(1)

	expect(permissions[0]).toMatchObject({
		action: "read",
		resource: "zmaj.files",
		conditions: {},
		fields: null,
	})
})
