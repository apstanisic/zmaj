import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { getSdk } from "../utils/test-sdk.js"

test.beforeAll(async () => getSdk().roles.temp__deleteWhere({ filter: { name: "TestCreated" } }))
test.afterEach(async () => getSdk().roles.temp__deleteWhere({ filter: { name: "TestCreated" } }))

test("Create role", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Roles & Permissions" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles")

	await page.getByRole("button", { name: /Create record/ }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajRoles/create")

	await page.getByLabel("Name").fill("TestCreated")
	await page.getByLabel("Description").fill("I am creating this role from playwright test!!!")

	await page.getByRole("button", { name: "Save" }).click()
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajRoles/$ID/show"))
	await expect(page.locator("body")).toContainText("Element created")
})
