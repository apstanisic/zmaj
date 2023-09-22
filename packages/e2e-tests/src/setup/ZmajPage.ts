import { Locator, Page, expect } from "@playwright/test"
import { join } from "node:path"
import { Orm } from "zmaj"

// https://stackoverflow.com/a/9310752
function escapeRegExp(text: string): string {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

export class ZmajPage {
	constructor(
		protected page: Page,
		protected orm: Orm,
		protected rootUrl: string,
	) {}

	adminUrl = "/admin"

	urlRegex(url: string = ""): RegExp {
		const fullUrl = escapeRegExp(join(this.adminUrl, this.rootUrl, url))
		return new RegExp(fullUrl)
	}

	async toHaveUrl(url: string = ""): Promise<void> {
		await expect(this.page).toHaveURL(this.urlRegex(url))
	}

	async urlEndsWith(text: string): Promise<void> {
		expect(this.page.url().endsWith(text)).toEqual(true)
	}

	async goHome(): Promise<void> {
		await this.page.goto("/")
		await expect(this.page).toHaveURL(new RegExp(this.adminUrl))
	}

	async hasCrudContent(text: string | RegExp | null): Promise<void> {
		await expect(this.page.locator(".crud-content")).toContainText(text ?? "")
	}

	async notHasCrudContent(text: string | RegExp | null): Promise<void> {
		await expect(this.page.locator(".crud-content")).not.toContainText(text ?? "")
	}

	async hasBodyContent(text: string | RegExp): Promise<void> {
		await expect(this.page.locator("body")).toContainText(text)
	}

	async hasToast(text: string | RegExp): Promise<void> {
		await expect(this.page.locator("body")).toContainText(text)
	}

	async notHasBodyContent(text: string | RegExp): Promise<void> {
		await expect(this.page.locator("body")).not.toContainText(text)
	}

	get checkIcons(): Locator {
		return this.page.getByTestId("CheckIcon")
	}

	async clickConfirmButton(): Promise<void> {
		await this.page.getByRole("button", { name: "Confirm" }).click()
	}

	async clickDeleteButton(): Promise<void> {
		await this.page.getByRole("button", { name: /Delete/ }).click()
	}
	async clickEditButton(): Promise<void> {
		await this.page.getByRole("button", { name: /Edit/ }).click()
	}

	async clickCancelButton(): Promise<void> {
		await this.page.getByRole("button", { name: /Cancel/ }).click()
	}

	async clickCreateButton(): Promise<void> {
		await this.page.getByRole("button", { name: /Create record/ }).click()
	}

	async clickSaveButton(): Promise<void> {
		await this.page.getByRole("button", { name: "Save" }).click()
	}

	async clickNextButton(): Promise<void> {
		await this.page.getByRole("button", { name: "Next" }).click()
	}

	async isOnRootPage(): Promise<void> {
		await expect(this.page).toHaveURL(this.urlRegex())
	}

	async clickLink(text: string | RegExp): Promise<void> {
		await this.page.getByRole("link", { name: text }).click()
	}
}
