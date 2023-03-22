import { expect, test } from "@playwright/test"
import { ChangeSettingsDto } from "@zmaj-js/common"
import { testSdk } from "../utils/test-sdk.js"
import { emptyState } from "../state/empty-state.js"

test.use({ storageState: emptyState })

async function deleteCurrentUser(): Promise<void> {
	const users = await testSdk.users.getMany({ filter: { email: "test123@example.com" } })
	const id = users.data.at(0)?.id
	if (!id) return
	await testSdk.users.deleteById({ id })
}

test.beforeEach(async () => {
	await testSdk.system.settings.changeSettings(new ChangeSettingsDto({ signUpAllowed: true }))
	await deleteCurrentUser()
})
test.afterEach(async () => deleteCurrentUser())

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
