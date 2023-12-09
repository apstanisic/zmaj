import { Locator, Page } from "@playwright/test"

type ByRoleOptions = Parameters<Page["getByRole"]>[1]
export class SelectorFixture {
	constructor(protected page: Page) {}

	textInput(label: string): Locator {
		return this.page.getByLabel(label, { exact: true })
	}

	urlInput(label: string): Locator {
		return this.textInput(label)
	}

	multilineTextInput(label: string): Locator {
		return this.page.getByLabel(label, { exact: true })
	}

	numberInput(label: string, options?: ByRoleOptions): Locator {
		return this.page.getByRole("textbox", { name: label, exact: true, ...options })
	}

	selectInput(label: string): Locator {
		return this.page.getByLabel(label, { exact: true })
	}
	selectInputOption(label: string, options?: ByRoleOptions): Locator {
		return this.page.getByRole("option", { name: label, ...options })
	}

	switchInput(label: string): Locator {
		return this.page.locator("label").getByText(label)
	}

	checkboxInput(label: string): Locator {
		return this.page.locator("label").getByLabel(label).locator("div").nth(1)
	}

	//
	//
	//
	async pickSelectValue(label: string, optionLabel: string): Promise<void> {
		await this.selectInput(label).click()
		await this.selectInputOption(optionLabel).click()
	}
}
