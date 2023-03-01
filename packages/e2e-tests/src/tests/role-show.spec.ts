import { expect, test } from "@playwright/test"
import { Role } from "@zmaj-js/common"
import { testSdk } from "../utils/test-sdk.js"

let role: Role

test.beforeEach(async () => {
	await testSdk.roles.temp__deleteWhere({ filter: { name: "TestToShow" } })
	role = await testSdk.roles.createOne({
		data: { name: "TestToShow", description: "Testing show role" },
	})
})
test.afterEach(async () => testSdk.roles.temp__deleteWhere({ filter: { name: "TestToShow" } }))

test("Show Role", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Roles & Permissions" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles")

	await page.getByRole("button", { name: `Show Record ${role.id}` }).click()

	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajRoles/${role.id}/show`)
	await expect(page.locator(".crud-content")).toContainText("TestToShow")
	await expect(page.locator(".crud-content")).toContainText("Testing show role")
})
