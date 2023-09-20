import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { getSdk } from "../utils/getSdk.js"

const email = "playwright-create@example.com"

test.beforeEach(async () => {
	await getSdk().users.temp__deleteWhere({ filter: { email }, idField: "id" })
})
test.afterAll(async () => {
	await getSdk().users.temp__deleteWhere({ filter: { email }, idField: "id" })
})

test("Create User", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Users" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajUsers")

	await page.getByRole("button", { name: /Create record/ }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajUsers/create")

	await page.getByRole("switch", { name: "Confirmed Email" }).click()

	await page.getByLabel("First Name").fill("Play")
	await page.getByLabel("Last Name").fill("Wright")
	await page.getByLabel(/^Email$/).fill(email)

	await page.getByRole("button", { name: /Status/ }).click()
	await page.getByRole("option", { name: /Disabled/ }).click()

	await page.locator("form #zmaj_x2o_input_roleId").locator("button").click()
	await page.getByRole("button", { name: "Public" }).click()

	await page.getByRole("button", { name: "Save" }).click()
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajUsers/$ID/show"))
})
