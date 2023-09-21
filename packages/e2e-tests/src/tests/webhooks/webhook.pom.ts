import { Page, expect } from "@playwright/test"
import { Webhook, WebhookCreateDto, WebhookModel } from "@zmaj-js/common"
import { Orm, OrmRepository } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"

export class WebhookPages extends ZmajCrudPage {
	constructor(page: Page, orm: Orm) {
		super(page, orm, "/#/zmajWebhooks")
	}
	title = "Webhooks"

	get repo(): OrmRepository<WebhookModel> {
		return this.orm.repoManager.getRepo(WebhookModel)
	}

	db = {
		deleteByName: async (name: string): Promise<void> => {
			await this.repo.deleteWhere({ where: { name } })
		},
		create: (dto: WebhookCreateDto): Promise<Webhook> => this.repo.createOne({ data: dto }),
		findByName: (name: string): Promise<Webhook | undefined> =>
			this.repo.findOne({ where: { name } }),
	}

	async hasSelectedEventsAmount(amount: number): Promise<void> {
		await expect(this.checkIcons).toHaveCount(amount)
	}

	async goToEventsTab(): Promise<void> {
		await this.page.getByRole("tab", { name: "Events" }).click()
	}

	async enableEvent(action: string, resource: string): Promise<void> {
		await this.page
			.getByRole("button", { name: new RegExp(`Enable event ${action}.${resource}$`) })
			.click()
	}

	async disableEvent(action: string, resource: string): Promise<void> {
		await this.page
			.getByRole("button", { name: new RegExp(`Disable event ${action}.${resource}$`) })
			.click()
	}
}
