import { expect, test } from "@playwright/test"
import { Permission, PermissionCreateDto, Role, throwErr } from "@zmaj-js/common"
import { getSdk } from "../utils/getSdk.js"

const roleName = "PermissionsShowRole"

let permission: Permission
let role: Role

test.beforeEach(async () => {
	const sdk = getSdk()
	// this will cascade delete permissions
	await sdk.roles.temp__deleteWhere({
		filter: { name: roleName },
	})
	role = await sdk.roles.createOne({ data: { name: roleName } })
	permission = await sdk.permissions.createOne({
		data: new PermissionCreateDto({
			action: "update",
			resource: "collections.posts",
			roleId: role.id,
			conditions: { title: { $ne: "hello_world" } },
			fields: ["body", "title"],
		}),
	})
})

test.afterEach(async () => getSdk().roles.temp__deleteWhere({ filter: { name: roleName } }))

test("Show Permission", async ({ page }) => {
	if (!permission || !role) throwErr("9127344")

	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Roles & Permissions" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles")

	await page.getByRole("button", { name: `Show record ${role.id}` }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajRoles/${role.id}/show`)

	// one permission enabled, but it's custom
	await expect(page.getByTestId("SettingsInputComponentIcon")).toHaveCount(1)

	// update
	// await page.getByRole("row", { name: "posts_" }).getByRole("button").nth(2).click()
	await page
		.getByRole("cell", { name: "Show permission dialog for update collections.posts", exact: true })
		.click()

	// await page.getByRole("button", { name: "Forbid" }).click()
	await expect(page.getByRole("tabpanel", { name: "Basic" })).toContainText(permission.id)
	await expect(page.getByRole("tabpanel", { name: "Basic" })).toContainText(permission.action)
	await expect(page.getByRole("tabpanel", { name: "Basic" })).toContainText(roleName)
	await expect(page.getByRole("tabpanel", { name: "Basic" })).toContainText("collections.posts")

	await page.getByRole("tab", { name: "Fields" }).click()
	await expect(
		page.getByRole("tabpanel", { name: "Fields" }).getByRole("checkbox", { checked: true }),
	).toHaveCount(2)
	await expect(page.locator('li:has-text("id") input[type="checkbox"]')).not.toBeChecked()
	await expect(page.locator('li:has-text("likes") input[type="checkbox"]')).not.toBeChecked()
	await expect(page.locator('li:has-text("title") input[type="checkbox"]')).toBeChecked()
	await expect(page.locator('li:has-text("body") input[type="checkbox"]')).toBeChecked()

	await page.getByRole("tab", { name: "Conditions" }).click()

	await expect(page.locator("#zmaj_input_conditions")).toContainText(
		JSON.stringify(permission.conditions, null, 4),
	)

	await page.getByRole("button", { name: "Cancel" }).click()
})
