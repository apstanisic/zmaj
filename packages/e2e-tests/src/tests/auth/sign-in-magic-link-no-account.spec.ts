import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueEmail } from "../../setup/e2e-unique-id.js"
import { emptyState } from "../../state/empty-state.js"

test.use({ storageState: emptyState })

test("Attempt magic link sign in with no account", async ({ page, context, authPage }) => {
	const email = getUniqueEmail()

	await authPage.goHome()
	await authPage.isOnLoginPage()

	await page.getByRole("button", { name: /Sign In With Email Link/ }).click()
	await page.getByTestId("s-dialog").getByLabel(/Email/).fill(email)
	await page.getByRole("button", { name: /Send link/ }).click()

	const emailIframe = await authPage.getLatestEmail(email, "Sign-in link")

	await expect(emailIframe.locator("body")).toContainText(
		"You tried to sign in with your email. You currently do not have account with us. If this wasn't you, you can ignore this email.",
	)
})
