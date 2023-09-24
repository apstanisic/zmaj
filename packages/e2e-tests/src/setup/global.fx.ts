import { Locator, Page, expect } from "@playwright/test"
import { escapeRegExp } from "@zmaj-js/common"

export class GlobalPageFx {
	constructor(protected page: Page) {}

	private homeUrl = "/admin"

	get sidebar(): Locator {
		return this.page.getByRole("navigation")
	}

	get alert(): Locator {
		return this.page.getByTestId("alert")
	}

	async expectAlertWithText(text: string): Promise<void> {
		await expect(this.alert).toHaveText(text)
	}

	sidebarLink(linkText: string): Locator {
		return this.sidebar.getByRole("link", { name: linkText, exact: true })
	}

	async goToHomeUrl(): Promise<void> {
		await this.page.goto("/")
		const url = escapeRegExp(this.homeUrl)
		await expect(this.page).toHaveURL(
			new RegExp(
				url +
					"(\\/?)" + // allows to match /admin/
					"(#\\/)?" + // allows to match /admin/#/ & /admin#/
					"$",
			),
		)
	}

	get confirmButton(): Locator {
		return this.button("Confirm")
	}

	get editButton(): Locator {
		return this.button("Edit")
	}

	get saveButton(): Locator {
		return this.button("Save")
	}

	get deleteButton(): Locator {
		return this.button("Delete")
	}

	get nextButton(): Locator {
		return this.button("Next")
	}

	button(buttonText: string): Locator {
		return this.page.getByRole("button").getByText(buttonText, { exact: true })
	}

	async hasInBody(text: string | RegExp): Promise<void> {
		await expect(this.page.locator("body")).toContainText(text)
	}
	async notHasInBody(text: string | RegExp): Promise<void> {
		await expect(this.page.locator("body")).not.toContainText(text)
	}

	async clickOnShowRecord(id: string): Promise<void> {
		await this.page.getByRole("button", { name: `Show Record ${id}` }).click()
		this.isOnShowPageUrl(id)
	}

	async isOnShowPageUrl(id: string): Promise<void> {
		await expect(this.page).toHaveURL(
			new RegExp(
				escapeRegExp(`${id}/show`) + "$", //
			),
		)
	}

	async isOnListPageUrl(resource: string): Promise<void> {
		await expect(this.page).toHaveURL(
			new RegExp(
				escapeRegExp("#/" + resource) + "$", //
			),
		)
	}

	get createRecordButton(): Locator {
		return this.page.getByRole("button", { name: "Create record" })
	}
}
