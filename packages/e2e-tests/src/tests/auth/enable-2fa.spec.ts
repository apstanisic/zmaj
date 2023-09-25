import { expect } from "@playwright/test"
import { authenticator } from "otplib"
import { test } from "../../setup/e2e-fixture.js"
import { emptyState } from "../../state/empty-state.js"

test.use({ storageState: emptyState })

test("Enable 2FA", async ({ page, authPage, userItem }) => {
	await authPage.goHome()
	await authPage.isOnLoginPage()

	await page.getByLabel("Email").fill(userItem.email)
	await page.getByLabel(/^Password$/).fill("password") /// pass is not pass
	await authPage.signInButton.click()
	await authPage.isOnHome()

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
	await authPage.clickConfirmButton()

	await authPage.hasBodyContent("2FA enabled")
	await authPage.urlEndsWith("/#/profile")
})
