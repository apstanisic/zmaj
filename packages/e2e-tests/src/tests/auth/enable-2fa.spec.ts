import { expect, test } from "@playwright/test"
import { ADMIN_ROLE_ID, User, UserCreateDto } from "@zmaj-js/common"
import { authenticator } from "otplib"
import { emptyState } from "../../state/empty-state.js"
import { getSdk } from "../../utils/e2e-get-sdk.js"

const email = "test-2fa@example.com"
let user: User

test.beforeAll(async () => {
	const sdk = getSdk()
	await sdk.users.temp__deleteWhere({ filter: { email } })
	user = await sdk.users.createOne({
		data: new UserCreateDto({
			email,
			confirmedEmail: true,
			status: "active",
			firstName: "Test",
			lastName: "Smith",
			roleId: ADMIN_ROLE_ID,
			password: "password",
		}),
	})
})
test.afterAll(async () => {
	await getSdk().users.temp__deleteWhere({ filter: { email } })
})

test.use({ storageState: emptyState })

test("Enable 2FA", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/#/login")
	await expect(page).toHaveURL("http://localhost:7100/admin/#/login")

	await page.getByLabel("Email").fill(email)
	await page.getByLabel(/^Password$/).fill("password") /// pass is not pass
	await page.getByRole("button", { name: /Sign in$/ }).click()

	await expect(page).toHaveURL("http://localhost:7100/admin/#/")

	await page.getByRole("button", { name: "More Actions" }).click()
	await page.getByRole("menuitem", { name: "Profile" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/profile")

	// await page.getByRole("link", { name: "Users" }).click()
	await page.getByRole("button", { name: "Enable 2FA" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/profile/2fa")

	await page.getByRole("button", { name: "Enable 2FA" }).click()

	// simulate getting code from phone
	// this calculates code based on secret, same as app
	const secret = await page.getByTestId("mfaSecret").innerText()
	const code = authenticator.generate(secret)

	await page.getByPlaceholder("123456").fill(code)
	await page.getByRole("button", { name: "Confirm" }).click()

	await expect(page.locator("body")).toContainText("2FA enabled")
	await expect(page).toHaveURL("http://localhost:7100/admin/#/profile")
})
