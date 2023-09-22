import { expect, test } from "@playwright/test"
import { ADMIN_ROLE_ID, UserCreateDto } from "@zmaj-js/common"
import { emptyState } from "../../state/empty-state.js"
import { getSdk } from "../../utils/e2e-get-sdk.js"

test.use({ storageState: emptyState })

const email = "magic-link-disabled@example.com"

test.beforeEach(async () => {
	const sdk = getSdk()
	await sdk.users.temp__deleteWhere({ filter: { email } })
	await sdk.users.createOne({
		data: new UserCreateDto({
			email,
			confirmedEmail: true,
			status: "disabled",
			roleId: ADMIN_ROLE_ID,
		}),
	})
})
test.afterEach(async () => {
	await getSdk().users.temp__deleteWhere({ filter: { email } })
})

test("Attempt magic link sign in with non active account", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/#/login")
	await expect(page).toHaveURL("http://localhost:7100/admin/#/login")

	await page.getByRole("button", { name: /Sign In With Email Link/ }).click()
	await page.getByTestId("s-dialog").getByLabel(/Email/).fill(email)
	await page.getByRole("button", { name: /Send link/ }).click()

	// go to MailHog gui
	await page.goto("http://localhost:7310")

	await page
		.getByText(/Sign-in link/)
		.first()
		.click()

	const iframe = page.frameLocator("#preview-html")
	await expect(iframe.locator("body")).toContainText(
		"You are not allowed to sign in currently. Please contact us if you need more info.",
	)

	// const page2 = await pagePromise
	// await page2.waitForLoadState()
	// // it should take us to invitation page

	// await expect(page2).toHaveURL("http://localhost:7100/admin/#/")
})
