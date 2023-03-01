import { expect, test } from "@playwright/test"
import { User, UserCreateDto } from "@zmaj-js/common"
import { testSdk } from "../utils/test-sdk.js"

const email = "playwright-update@example.com"
const updatedEmail = "playwright-updated@example.com"

let user: User

test.beforeAll(async () => {
	await testSdk.users.temp__deleteWhere({ filter: { email }, idField: "id" })
	await testSdk.users.temp__deleteWhere({ filter: { email: updatedEmail }, idField: "id" })
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
	await testSdk.users.temp__deleteWhere({ filter: { email }, idField: "id" })
	await testSdk.users.temp__deleteWhere({ filter: { email: updatedEmail }, idField: "id" })
})

test("Update User", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Users" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajUsers")

	await page.getByRole("button", { name: `Show Record ${user.id}` }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajUsers/${user.id}/show`)

	await page.getByRole("button", { name: /Edit/ }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajUsers/${user.id}`)

	await page.getByLabel(/^Email$/).fill(updatedEmail)
	await page.getByLabel("First Name").fill("Changed")
	await page.getByLabel("Last Name").fill("Data")

	await page.getByRole("button", { name: /Active/ }).click()
	await page.getByText("Disabled").click()

	await page.getByRole("button", { name: /Public/ }).click()

	await page.getByRole("button", { name: "Admin" }).click()

	await page.getByRole("button", { name: "Save" }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajUsers/${user.id}/show`)

	await expect(page.getByText("Element updated")).toHaveCount(1)

	await expect(page.locator(".crud-content")).toContainText(updatedEmail)
	await expect(page.locator(".crud-content")).toContainText("Changed")
	await expect(page.locator(".crud-content")).toContainText("Data")
	await expect(page.locator(".crud-content")).toContainText("disabled")
	await expect(page.locator(".crud-content")).toContainText("Admin")
})
