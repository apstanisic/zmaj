import { test } from "../../setup/e2e-fixture.js"
import { emptyState } from "../../state/empty-state.js"

// import emptyState from "../state/empty-state.json"
test.use({ storageState: emptyState })

test("Sign in with magic link", async ({ page, context, userItem, authPage }) => {
	await authPage.goHome()
	await authPage.isOnLoginPage()

	await page.getByRole("button", { name: /Sign In With Email Link/ }).click()
	await page.getByTestId("s-dialog").getByLabel(/Email/).fill(userItem.email)
	await page.getByRole("button", { name: /Send link/ }).click()

	// go to MailHog gui
	await authPage.openEmailInbox()

	const emailIframe = await authPage.getLatestEmail(userItem.email, "Sign-in link")

	const newPage = await authPage.waitForNewPage({
		context,
		trigger: () => emailIframe.getByRole("link", { name: "Sign in" }).click(),
	})

	// switch page internally
	authPage.page = newPage
	await authPage.isOnHome()
})
