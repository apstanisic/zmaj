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
		}),
	)
})

test.afterEach(async ({ permissionPage }) => permissionPage.db.deleteRole(role.name))

test("Delete Permission", async ({ rolePage, permissionPage }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(role.id)
	await permissionPage.hasAllowedPermissionsAmount(1)

	await permissionPage.openPermissionDialog(permission.action, permission.resource)

	await permissionPage.clickForbidButton()
	// await expect(async () => {
	await permissionPage.hasAllowedPermissionsAmount(0)
	// }).toPass()

	await permissionPage.hasToast("Successfully removed permission")

	expect(await permissionPage.db.findPermission(permission.id)).toBeUndefined()
})
