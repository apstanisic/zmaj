import { expect, test } from "@playwright/test"
import { Permission, PermissionCreateDto, Role, throwErr } from "@zmaj-js/common"
import { testSdk } from "../utils/test-sdk.js"

const roleName = "PermissionsDeleteRole"

// test.describe()
let permission: Permission
let role: Role

test.beforeEach(async () => {
	// this will cascade delete permissions
	await testSdk.roles.temp__deleteWhere({
		filter: { name: roleName },
	})
	role = await testSdk.roles.createOne({ data: { name: roleName } })
	permission = await testSdk.permissions.createOne({
		data: new PermissionCreateDto({
			action: "create",
			resource: "collections.posts",
			roleId: role.id,
		}),
	})
})

test.afterEach(async () => testSdk.roles.temp__deleteWhere({ filter: { name: roleName } }))

test("Delete Permission", async ({ page }) => {
	if (!permission) throwErr("89741909")

	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Roles & Permissions" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles")

	await page.getByRole("button", { name: `Show Record ${role.id}` }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajRoles/${permission.roleId}/show`)

	// one permission enabled
	await expect(page.getByTestId("CheckIcon")).toHaveCount(1)

	// await page.getByRole("row", { name: "posts" }).getByRole("button").nth(1).click()
	await page
		.getByRole("cell", { name: /Show permission dialog for create collections.posts$/ })
		.click()

	await page.getByRole("button", { name: "Forbid" }).click()

	// 0 permissions enabled
	await expect(page.getByTestId("CheckIcon")).toHaveCount(0)
	await expect(page.locator("body")).toContainText("Successfully removed permission")

	const withRole = await testSdk.permissions.getMany({ filter: { roleId: permission.roleId } })
	expect(withRole.data).toHaveLength(0)
})
