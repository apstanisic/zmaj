import { expect, test } from "@playwright/test"
import { User, UserCreateDto } from "@zmaj-js/common"
import { createIdRegex } from "../utils/create-id-regex.js"
import { testSdk } from "../utils/test-sdk.js"

const email = "playwright-show@example.com"
let user: User

test.beforeAll(async () => {
	await testSdk.users.temp__deleteWhere({ filter: { email } })
	user = await testSdk.users.createOne({
		data: new UserCreateDto({
			email,
			confirmedEmail: true,
			status: "active",
			firstName: "Test",
			lastName: "Smith",
		}),
	})
})
test.afterAll(async () => {
	await testSdk.users.temp__deleteWhere({ filter: { email } })
})

test("Show User", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Users" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajUsers")

	await page.getByRole("button", { name: `Show Record ${user.id}` }).click()
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajUsers/$ID/show"))
	await expect(page.locator(".crud-content")).toContainText(email)
	await expect(page.locator(".crud-content")).toContainText("Test")
	await expect(page.locator(".crud-content")).toContainText("Smith")
	await expect(page.locator(".crud-content")).toContainText("active")
})
