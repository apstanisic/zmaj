import { expect, test } from "@playwright/test"
import { Role, sleep } from "@zmaj-js/common"
import { getSdk } from "../utils/getSdk.js"

const roleName = "PlaywrightRoleAddAdvanced"
let role: Role

test.beforeEach(async () => {
	const sdk = getSdk()
	await sdk.roles.temp__deleteWhere({ filter: { name: roleName } })
	role = await sdk.roles.createOne({
		data: { name: roleName, description: "Role for e2e testing" },
	})
})
test.afterEach(async () => getSdk().roles.temp__deleteWhere({ filter: { name: roleName } }))

test("Add permission with custom fields and conditions", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Roles & Permissions" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles")

	await page.getByRole("button", { name: "Show Record " + role.id }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajRoles/${role.id}/show`)

	await page.getByRole("tab", { name: "System" }).click()

	await page.getByRole("button", { name: "Download & Read Info" }).click()

	await page.getByRole("tab", { name: "Fields" }).click()

	await page.locator('li:has-text("Select all") input[type="checkbox"]').uncheck()

	await page.locator('li:has-text("id") input[type="checkbox"]').first().check()
	await page.locator('li:has-text("name") input[type="checkbox"]').check()
	await page.locator('li:has-text("mimeType") input[type="checkbox"]').check()
	await page.locator('li:has-text("description") input[type="checkbox"]').check()

	await page.getByRole("tab", { name: "Conditions" }).click()

	await page.getByText("{}").click()
	await page.keyboard.press("Backspace")
	await page.keyboard.press("Backspace")
	// await page.getByLabel("Conditions").click()

	const toType = {
		fileSize: {
			$gte: 1000,
		},
	}
	await page.keyboard.type(JSON.stringify(toType))

	await page.getByRole("button", { name: "Enable" }).click()
	await expect(page.locator("body")).toContainText("Permissions successfully updated")

	await sleep(200)
	// check if it's saved properly
	const res = await getSdk().permissions.getMany({
		filter: { action: "read", resource: "zmaj.files" },
	})
	const item = res.data.at(0)
	expect(item).toMatchObject({
		action: "read",
		resource: "zmaj.files",
		conditions: toType,
		fields: expect.arrayContaining(["id", "name", "mimeType", "description"]),
	})
})
