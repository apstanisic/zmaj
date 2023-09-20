import { expect, test } from "@playwright/test"
import { Permission, PermissionCreateDto, Role, UnknownValues, throwErr } from "@zmaj-js/common"
import { getSdk } from "../utils/e2e-get-sdk.js"

const roleName = "PermissionsUpdateRole"

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
			action: "create",
			resource: "collections.posts",
			roleId: role.id,
			conditions: { title: { $ne: "hello_world" } },
			fields: ["body", "title"],
		}),
	})
})

test.afterEach(async () => getSdk().roles.temp__deleteWhere({ filter: { name: roleName } }))

test("Update Permission", async ({ page }) => {
	if (!permission) throwErr("9127344")

	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Roles & Permissions" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles")

	await page.getByRole("button", { name: `Show Record ${role.id}` }).click()
	// await page.getByRole("cell", { name: roleName }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajRoles/${permission.roleId}/show`)

	// one permission enabled, but it's custom
	await expect(page.getByTestId("SettingsInputComponentIcon")).toHaveCount(1)

	// await page.getByRole("row", { name: "posts_" }).getByRole("button").nth(1).click()
	await page
		.getByRole("cell", { name: "Show permission dialog for create collections.posts", exact: true })
		.click()

	await page.getByRole("tab", { name: "Fields" }).click()

	// await page.locator('li:has-text("Select all") input[type="checkbox"]').check()
	await page.getByRole("checkbox", { name: "Select all" }).check()

	await page.getByRole("tab", { name: "Conditions" }).click()

	await page.getByText(/"hello_world"/).click()
	await page.keyboard.press("Control+a")
	await page.keyboard.press("Delete")

	await page.keyboard.type(JSON.stringify({ title: "updated_title" }))

	// await page.getByText(/\{\s+"title":\s+\{\s+"\$ne":\s+"hello_world"\s+\}\s+\}/).click();

	// await page.getByText(/"hello_world"/).click();

	// await page.getByText(/"hello_world"/).click();

	// await page.getByText(/"hello_world"/).click();

	// await page.getByText(/\{\s+"title":\s+\{\s+"\$ne":\s+"hello_world"\s+\}\s+\}/).press('Control+a');

	await page.getByRole("button", { name: "Change" }).click()

	await expect(page.locator("body")).toContainText("Permissions successfully updated")
	const updated = await getSdk().permissions.getById({ id: permission.id })
	expect(updated).toEqual({
		...permission,
		fields: null,
		conditions: { title: "updated_title" },
	} as UnknownValues<Permission>)
})
