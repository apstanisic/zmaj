import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"

test("Delete Permission", async ({ rolePage, permissionPage, permissionItem, permissionFx }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(permissionItem.roleId)
	await permissionPage.hasAllowedPermissionsAmount(1)

	await permissionPage.openPermissionDialog(permissionItem.action, permissionItem.resource)

	await permissionPage.clickForbidButton()
	// await expect(async () => {
	await permissionPage.hasAllowedPermissionsAmount(0)
	// }).toPass()

	await permissionPage.hasToast("Successfully removed permission")

	expect(await permissionFx.findPermission(permissionItem.id)).toBeUndefined()
})
