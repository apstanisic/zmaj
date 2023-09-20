import { expect, test } from "@playwright/test"
import { Role } from "@zmaj-js/common"
import { createIdRegex } from "../utils/create-id-regex.js"
import { getSdk } from "../utils/e2e-get-sdk.js"

const roleName = "PlaywrightRoleAddSimple"
let role: Role

test.beforeEach(async () => {
	const sdk = getSdk()
	await sdk.roles.temp__deleteWhere({ filter: { name: roleName } })
	role = await sdk.roles.createOne({
		data: { name: roleName, description: "Role for e2e testing" },
	})
})
test.afterEach(async () => getSdk().roles.temp__deleteWhere({ filter: { name: roleName } }))

test("Add permission", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Roles & Permissions" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles")

	await page.getByRole("button", { name: `Show Record ${role.id}` }).click()
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajRoles/$ID/show"))

	await page.getByRole("tab", { name: "System" }).click()

	await page.getByRole("button", { name: "Download & Read Info" }).click()

	await page.getByRole("tab", { name: "Fields" }).click()

	await page.getByRole("button", { name: "Enable" }).click()
	await expect(page.locator("body")).toContainText("Permissions successfully updated")

	// check if it's saved properly
	// const roleInDb = await testSdk.roles.getOne({ filter: { name: roleName } })
	const permission = await getSdk().permissions.getOne({
		filter: { roleId: role.id },
	})

	expect(permission).toMatchObject({
		action: "read",
		resource: "zmaj.files",
		conditions: {},
		fields: null,
	})
})
