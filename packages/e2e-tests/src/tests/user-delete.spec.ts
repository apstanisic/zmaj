import { expect, test } from "@playwright/test"
import { User, UserCreateDto } from "@zmaj-js/common"
import { getSdk } from "../utils/getSdk.js"

const email = "playwright-delete@example.com"
let user: User

test.beforeAll(async () => {
	user = await getSdk().users.createOne({
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
	await getSdk().users.temp__deleteWhere({ filter: { email }, idField: "id" })
})

test("Delete User", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Users" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajUsers")

	await page.getByRole("button", { name: `Show Record ${user.id}` }).click()
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajUsers/${user.id}/show`)

	await page.getByRole("button", { name: /Delete/ }).click()
	// await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/zmajUsers/$ID"))

	await page.getByRole("button", { name: "Confirm" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajUsers")

	await expect(page.getByText("Element deleted")).toHaveCount(1)

	const remain = await getSdk().users.getMany({ filter: { email } })
	expect(remain.data).toHaveLength(0)
})
