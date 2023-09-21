import { Locator, Page, expect } from "@playwright/test"
import { join } from "node:path"
import { Orm } from "zmaj"

export class ZmajPage {
	constructor(
		protected page: Page,
		protected orm: Orm,
		protected rootUrl: string,
	) {}

	adminUrl = new RegExp("/admin")

	urlRegex(url: string = ""): RegExp {
		return new RegExp(join("/admin", this.rootUrl, url))
	}

	async toHaveUrl(url: string = ""): Promise<void> {
		await expect(this.page).toHaveURL(this.urlRegex(url))
	}

	async goHome(): Promise<void> {
		await this.page.goto("/")
		expect(this.page).toHaveURL(this.adminUrl)
	}

	async hasCrudContent(text: string | RegExp | null): Promise<void> {
		await expect(this.page.locator(".crud-content")).toContainText(text ?? "")
	}
	async hasBodyContent(text: string | RegExp): Promise<void> {
		await expect(this.page.locator("body")).toContainText(text)
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

	async clickEditButton(id: string): Promise<void> {
		await this.page.getByRole("button", { name: `Edit record ${id}` }).click()
		await this.toHaveUrl(id)
	}

	async clickCreateButton(): Promise<void> {
		await this.page.getByRole("button", { name: /Create record/ }).click()
	}

	async clickSaveButton(): Promise<void> {
		await this.page.getByRole("button", { name: "Save" }).click()
	}

	async isOnRootPage(): Promise<void> {
		await expect(this.page).toHaveURL(this.urlRegex())
	}

	async clickLink(text: string | RegExp): Promise<void> {
		await this.page.getByRole("link", { name: text }).click()
	}
}
