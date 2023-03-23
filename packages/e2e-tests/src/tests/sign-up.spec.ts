import { expect, test } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { ChangeSettingsDto } from "@zmaj-js/common"
import { emptyState } from "../state/empty-state.js"
import { getSdk } from "../utils/test-sdk.js"

test.use({ storageState: emptyState })

async function deleteCurrentUser(sdk: ZmajSdk): Promise<void> {
	const users = await sdk.users.getMany({ filter: { email: "test123@example.com" } })
	const id = users.data.at(0)?.id
	if (!id) return
	await sdk.users.deleteById({ id })
}

test.beforeEach(async () => {
	const sdk = getSdk()
	await sdk.system.settings.changeSettings(new ChangeSettingsDto({ signUpAllowed: true }))
	await deleteCurrentUser(sdk)
})
test.afterEach(async () => deleteCurrentUser(getSdk()))

test("Sign Up", async ({ page }) => {
	// Go to http://localhost:7100/admin/#/sign-up
	await page.goto("http://localhost:7100/admin/#/sign-up")

	await page.getByLabel("First Name").fill("John")
	await page.getByLabel("Last Name").fill("John")
	await page.getByLabel("Email").fill("test123@example.com")
	await page.getByLabel(/^Password$/).fill("password")

	await page.getByRole("button", { name: "Sign Up" }).click()

	await expect(page).toHaveURL("http://localhost:7100/admin/#/login")
	await expect(page.locator("body")).toContainText("Sign up successful. Please confirm email")
})
