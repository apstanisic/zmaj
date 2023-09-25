import { test } from "../../setup/e2e-fixture.js"

test.beforeEach(async ({ permissionItem, permissionFx }) => {
	const updated = await permissionFx.update(permissionItem.id, {
		conditions: { title: { $ne: "hello_world" } },
		fields: ["body", "title"],
	})
	// update existing permissionItem
	Object.assign(permissionItem, updated)
})

test("Show Permission", async ({ rolePage, permissionPage, zRole, permissionItem }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(permissionItem.roleId)

	// one permission enabled, but it's custom
	await permissionPage.hasPartialPermissionsAmount(1)

	await permissionPage.openPermissionDialog(permissionItem.action, permissionItem.resource)

	await permissionPage.hasTextOnBasicTab(permissionItem.id)
	await permissionPage.hasTextOnBasicTab(permissionItem.action)
	await permissionPage.hasTextOnBasicTab(zRole.name)
	await permissionPage.hasTextOnBasicTab(permissionItem.resource)

	await permissionPage.goToFieldsTab()

	await permissionPage.hasAllowedFieldsAmount(2)
	await permissionPage.hasForbiddenField("id")
	await permissionPage.hasForbiddenField("likes")
	await permissionPage.hasAllowedField("title")
	await permissionPage.hasAllowedField("body")

	await permissionPage.goToConditionsTab()

	await permissionPage.hasCondition(permissionItem.conditions)

	await permissionPage.clickCancelButton()
})
