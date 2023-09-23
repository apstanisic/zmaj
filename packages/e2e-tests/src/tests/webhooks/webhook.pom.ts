import { Page, expect } from "@playwright/test"
import { Webhook, WebhookCreateDto, WebhookModel, WebhookUpdateDto } from "@zmaj-js/common"
import { Orm, OrmRepository, RepoFilterWhere } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"

export class WebhookPages extends ZmajCrudPage {
	constructor(page: Page) {
		super(page, "/#/zmajWebhooks")
	}
	title = "Webhooks"

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

export class WebhookUtilsFx {
	constructor(private orm: Orm) {}

	get repo(): OrmRepository<WebhookModel> {
		return this.orm.repoManager.getRepo(WebhookModel)
	}

	async deleteWhere(where: RepoFilterWhere<WebhookModel>): Promise<void> {
		await this.repo.deleteWhere({ where })
	}

	async create(dto: WebhookCreateDto): Promise<Webhook> {
		return this.repo.createOne({ data: dto })
	}

	async update(id: string, changes: WebhookUpdateDto): Promise<Webhook> {
		return this.repo.updateById({ id, changes })
	}

	async findWhere(where: RepoFilterWhere<WebhookModel>): Promise<Webhook | undefined> {
		return this.repo.findOne({ where })
	}
}
