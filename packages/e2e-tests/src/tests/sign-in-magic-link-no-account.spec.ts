import { expect, test } from "@playwright/test"
import { emptyState } from "../state/empty-state.js"

test.use({ storageState: emptyState })

const email = "non-existing-magic-link@example.com"

test("Attempt magic link sign in with no account", async ({ page, context }) => {
	await page.goto("http://localhost:7100/admin/#/login")
	await expect(page).toHaveURL("http://localhost:7100/admin/#/login")

	await page.getByRole("button", { name: /Sign In With Email Link/ }).click()
	await page.getByTestId("s-dialog").getByLabel(/Email/).fill(email)
	await page.getByRole("button", { name: /Send link/ }).click()

	// go to MailHog gui
	await page.goto("http://localhost:7310")

	await page.getByText(/Sign-in link/).first().click()

	const iframe = page.frameLocator("#preview-html")
	await expect(iframe.locator("body")).toContainText(
		"You tried to sign in with your email. You currently do not have account with us. If this wasn't you, you can ignore this email.",
	)

	// const page2 = await pagePromise
	// await page2.waitForLoadState()
	// // it should take us to invitation page

	// await expect(page2).toHaveURL("http://localhost:7100/admin/#/")
})
