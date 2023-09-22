import { expect } from "@playwright/test"
import { Struct } from "@zmaj-js/common"
import { join } from "node:path"
import { toRaQuery } from "../utils/test-sdk.js"
import { ZmajPage } from "./ZmajPage.js"

export abstract class ZmajCrudPage extends ZmajPage {
	abstract title: string
	async goToList(): Promise<void> {
		await this.page.getByRole("link", { name: this.title }).click()
		const vv = { v: this.urlRegex() }

		await expect(this.page).toHaveURL(this.urlRegex())
	}

	async goToListWithQuery(rawQuery: Struct): Promise<void> {
		const query = toRaQuery(rawQuery)
		const fullPath = join(this.adminUrl, this.rootUrl, `?${query}`)
		await this.page.goto(fullPath)
		await expect(this.page).toHaveURL(fullPath)
	}

	async goToShow(id: string): Promise<void> {
		await this.page.getByRole("button", { name: `Show Record ${id}` }).click()
		await expect(this.page).toHaveURL(this.urlRegex(`${id}/show`))
	}

	async clickEditButtonInList(id: string): Promise<void> {
		await this.page.getByRole("button", { name: `Edit record ${id}` }).click()
		await this.toHaveUrl(id)
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
