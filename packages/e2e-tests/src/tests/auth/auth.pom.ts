import { BrowserContext, FrameLocator, Locator, Page, expect } from "@playwright/test"
import { ZmajPage } from "../../setup/ZmajPage.js"

export class AuthPage extends ZmajPage {
	passwordHash?: string

	async isOnLoginPage(): Promise<void> {
		await expect(this.page).toHaveURL(/admin\/#\/login/)
	}

	get signInButton(): Locator {
		return this.page.getByRole("button", { name: /Sign in$/ })
	}

	async openEmailInbox(): Promise<void> {
		await this.page.goto("http://localhost:7310")
	}

	async isOnHome(): Promise<void> {
		await expect(this.page).toHaveURL(/admin\/#\/$/)
	}

	async logout(): Promise<void> {
		await this.page.getByLabel("More Actions").click()
		await this.page.getByRole("menuitem", { name: "Logout" }).click()
		await expect(async () => {
			await this.isOnLoginPage()
		}).toPass()
	}

	async typeSignUpUrl(): Promise<void> {
		await this.page.goto("/admin#/sign-up")
		await expect(this.page).toHaveURL(/admin\/#\/sign-up/)
	}

	async getLatestEmail(email: string, title: string): Promise<FrameLocator> {
		await this.openEmailInbox()

		// get only relevant emails (avoid clashes)
		await this.page.getByPlaceholder("Search").fill(email)
		await this.page.keyboard.press("Enter")

		await this.page.getByText(`${title} - Zmaj Test App`, { exact: true }).first().click()

		const iframe = this.page.frameLocator("#preview-html")
		return iframe
		// await expect(iframe.locator("body")).toContainText(
		// 	"You tried to sign in with your email. You currently do not have account with us. If this wasn't you, you can ignore this email.",
		// )
	}

	// https://playwright.dev/docs/frames
	// https://playwright.dev/docs/pages#handling-new-pages
	async waitForNewPage(params: {
		context: BrowserContext
		trigger: () => void | Promise<void>
	}): Promise<Page> {
		const { context, trigger } = params
		const pagePromise = context.waitForEvent("page")
		await trigger()

		const newPage = await pagePromise
		await newPage.waitForLoadState()
		return newPage
	}

	async isOnPasswordResetPage(): Promise<void> {
		await this.toHaveUrl("/auth/password-reset")
	}

	async goToLoginPage(): Promise<void> {
		await this.page.goto("/admin/#/login")
		await this.isOnLoginPage()
	}
}
