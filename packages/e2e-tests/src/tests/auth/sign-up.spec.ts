import { ChangeSettingsDto } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueEmail } from "../../setup/e2e-unique-id.js"
import { emptyState } from "../../state/empty-state.js"

test.use({ storageState: emptyState })

let email: string

test.beforeEach(async ({ sdk }) => {
	email = getUniqueEmail()
	await sdk.system.settings.changeSettings(new ChangeSettingsDto({ signUpAllowed: true }))
})

test.afterEach(async ({ userFx }) => userFx.removeWhere({ email }))

test("Sign Up", async ({ page, authPage }) => {
	await page.goto("/")
	// expect redirect to login page
	await authPage.isOnLoginPage()

	await authPage.typeSignUpUrl()

	await page.getByLabel("First Name").fill("John")
	await page.getByLabel("Last Name").fill("Smith")
	await page.getByLabel("Email").fill(email)
	await page.getByLabel(/^Password$/).fill("password")

	await page.getByRole("button", { name: "Sign Up" }).click()

	await authPage.isOnLoginPage()
	await authPage.hasToast("Sign up successful. Please confirm email")
})
