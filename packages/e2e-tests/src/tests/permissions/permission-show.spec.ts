import { Permission, PermissionCreateDto, Role } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"

let permission: Permission
let role: Role

test.beforeEach(async ({ permissionPage }) => {
	role = await permissionPage.db.createRole()
	permission = await permissionPage.db.createPermission(
		new PermissionCreateDto({
			action: "update",
			resource: "collections.posts",
			roleId: role.id,
			conditions: { title: { $ne: "hello_world" } },
			fields: ["body", "title"],
		}),
	)
})

test.afterEach(async ({ permissionPage }) => permissionPage.db.deleteRole(role.name))

test("Show Permission", async ({ rolePage, permissionPage }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(role.id)

	// one permission enabled, but it's custom
	await permissionPage.hasPartialPermissionsAmount(1)

	await permissionPage.openPermissionDialog("update", "collections.posts")

	await permissionPage.hasTextOnBasicTab(permission.id)
	await permissionPage.hasTextOnBasicTab(permission.action)
	await permissionPage.hasTextOnBasicTab(role.name)
	await permissionPage.hasTextOnBasicTab("collections.posts")

	await permissionPage.goToFieldsTab()

	await permissionPage.hasAllowedFieldsAmount(2)
	await permissionPage.hasForbiddenField("id")
	await permissionPage.hasForbiddenField("likes")
	await permissionPage.hasAllowedField("title")
	await permissionPage.hasAllowedField("body")

	await permissionPage.goToConditionsTab()

	await permissionPage.hasCondition(permission.conditions)

	await permissionPage.clickCancelButton()
})
