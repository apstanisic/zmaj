import { expect } from "@playwright/test"
import { ZmajPage } from "./ZmajPage.js"

export abstract class ZmajCrudPage extends ZmajPage {
	abstract title: string
	async goToList(): Promise<void> {
		await this.page.getByRole("link", { name: this.title }).click()
		await expect(this.page).toHaveURL(this.urlRegex())
	}

	async goToShow(id: string): Promise<void> {
		await this.page.getByRole("button", { name: `Show Record ${id}` }).click()
		await expect(this.page).toHaveURL(this.urlRegex(`${id}/show`))
	}

	async isOnListPage(): Promise<void> {
		await this.isOnRootPage()
	}

	async isOnShowPage(id: string): Promise<void> {
		await this.toHaveUrl(`${id}/show`)
	}

	async isOnEditPage(id: string): Promise<void> {
		await this.toHaveUrl(id)
	}

	async elementDeletedVisible(): Promise<void> {
		await expect(this.page.getByText("Element deleted")).toHaveCount(1)
	}
	async elementUpdatedVisible(): Promise<void> {
		await expect(this.page.getByText("Element updated")).toHaveCount(1)
	}

	async elementCreatedVisible(): Promise<void> {
		await expect(this.page.getByText("Element created")).toHaveCount(1)
	}
}
