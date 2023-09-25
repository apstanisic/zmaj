import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"
import { emptyState } from "../../state/empty-state.js"

test.use({ storageState: emptyState })

test.beforeEach(async ({ userFx, userItem }) => {
	await userFx.repo.updateById({
		id: userItem.id,
		changes: { status: "disabled" },
	})
})

test("Attempt magic link sign in with non active account", async ({ page, authPage, userItem }) => {
	await authPage.goHome()
	await authPage.isOnLoginPage()

	await page.getByRole("button", { name: /Sign In With Email Link/ }).click()
	await page.getByTestId("s-dialog").getByLabel(/Email/).fill(userItem.email)
	await page.getByRole("button", { name: /Send link/ }).click()

	const emailIframe = await authPage.getLatestEmail(userItem.email, "Sign-in link")
	await expect(emailIframe.locator("body")).toContainText(
		"You are not allowed to sign in currently. Please contact us if you need more info.",
	)
})
