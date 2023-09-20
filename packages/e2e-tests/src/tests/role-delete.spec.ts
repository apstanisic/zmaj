import { expect, test } from "@playwright/test"
import { Role } from "@zmaj-js/common"
import { getSdk } from "../utils/e2e-get-sdk.js"

let role: Role

test.beforeEach(async () => {
	const sdk = getSdk()
	await sdk.roles.temp__deleteWhere({ filter: { name: "TestToDelete" } })
	role = await sdk.roles.createOne({ data: { name: "TestToDelete" } })
})
test.afterEach(async () => getSdk().roles.temp__deleteWhere({ filter: { name: "TestToDelete" } }))

test("Delete Role", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Roles & Permissions" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles")

	await page.getByRole("button", { name: `Show Record ${role.id}` }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajRoles/${role.id}/show`)

	await page.getByRole("button", { name: /^Delete record/ }).click()
	await page.getByRole("button", { name: "Confirm" }).click()

	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles")
	await expect(page.locator("body")).toContainText("Element deleted")
})
