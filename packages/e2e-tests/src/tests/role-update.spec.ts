import { expect, test } from "@playwright/test"
import { Role } from "@zmaj-js/common"
import { createIdRegex } from "../utils/create-id-regex.js"
import { getSdk } from "../utils/getSdk.js"

let role: Role

test.beforeAll(async () => {
	const sdk = getSdk()
	await sdk.roles.temp__deleteWhere({ filter: { name: "TestToUpdate" } })
	await sdk.roles.temp__deleteWhere({ filter: { name: "UpdatedRole" } })
	role = await sdk.roles.createOne({
		data: { name: "TestToUpdate", description: "Hello World!!!" },
	})
})
test.afterEach(async () => {
	const sdk = getSdk()
	await sdk.roles.temp__deleteWhere({ filter: { name: "TestToUpdate" } })
	await sdk.roles.temp__deleteWhere({ filter: { name: "UpdatedRole" } })
})

test("Update Role", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Roles & Permissions" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles")

	await page.getByRole("button", { name: `Edit Record ${role.id}` }).click()

	// await page.getByRole("button", { name: /Edit/ }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajRoles/${role.id}`)

	await page.getByLabel("Name").fill("UpdatedRole")
	await page.getByLabel("Description").fill("Updated Description!!!!!!!!!!")

	await page.getByRole("button", { name: "Save" }).click()

	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajRoles/$ID/show"))
	await expect(page.locator(".crud-content")).toContainText("UpdatedRole")
	await expect(page.locator(".crud-content")).toContainText("Updated Description")
})
