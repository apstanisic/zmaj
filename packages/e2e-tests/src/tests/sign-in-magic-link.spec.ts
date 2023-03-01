import { expect, test } from "@playwright/test"
import { testSdk } from "../utils/test-sdk.js"

import { ADMIN_ROLE_ID, UserCreateDto } from "@zmaj-js/common"
import { emptyState } from "../state/empty-state.js"

// import emptyState from "../state/empty-state.json"
test.use({ storageState: emptyState })

const email = "magic-link@example.com"

test.beforeEach(async () => {
	await testSdk.users.temp__deleteWhere({ filter: { email } })
	await testSdk.users.createOne({
		data: new UserCreateDto({
			email,
			confirmedEmail: true,
			status: "active",
			roleId: ADMIN_ROLE_ID,
		}),
	})
})
test.afterEach(async () => {
	await testSdk.users.temp__deleteWhere({ filter: { email } })
})

test("Sign in with magic link", async ({ page, context }) => {
	await page.goto("http://localhost:7100/admin/#/login")
	await expect(page).toHaveURL("http://localhost:7100/admin/#/login")

	await page.getByRole("button", { name: /Sign In With Email Link/ }).click()
	await page.getByTestId("s-dialog").getByLabel(/Email/).fill(email)
	await page.getByRole("button", { name: /Send link/ }).click()

	// go to MailHog gui
	await page.goto("http://localhost:7310")

	await page.getByText(/Sign-in link/).first().click()

	// https://playwright.dev/docs/pages#handling-new-pages
	const pagePromise = context.waitForEvent("page")
	// email is displayed in iframe
	// https://playwright.dev/docs/frames
	await page.frameLocator("#preview-html").getByRole("link", { name: "Sign in" }).click()

	const page2 = await pagePromise
	await page2.waitForLoadState()
	// it should take us to invitation page

	await expect(page2).toHaveURL("http://localhost:7100/admin/#/")
})
