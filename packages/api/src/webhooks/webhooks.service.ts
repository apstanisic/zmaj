import type { CrudAfterEvent, CrudFinishEvent } from "@api/crud/crud-event.types"
import { OnCrudEvent } from "@api/crud/on-crud-event.decorator"
import { HttpClient } from "@api/http-client/http-client.service"
import { Injectable, OnModuleInit } from "@nestjs/common"
import { Struct, Webhook, WebhookCollection, WebhookModel } from "@zmaj-js/common"
import { OrmRepository, RepoManager } from "@zmaj-js/orm"

/**
 * Webhooks CRUD service
 */
@Injectable()
export class WebhooksService implements OnModuleInit {
	/**
	 * All webhooks in the app
	 */
	private allWebhooks: Webhook[] = []
	private repo: OrmRepository<WebhookModel>

	constructor(
		private readonly http: HttpClient,
		private readonly repoManager: RepoManager, //
	) {
		this.repo = this.repoManager.getRepo(WebhookModel)
	}

	/**
	 * Get all webhooks on app startup
	 */
	async onModuleInit(): Promise<void> {
		this.allWebhooks = await this.repo.findWhere({})
	}

	/**
	 * When somebody change webhooks, this will refetch them
	 */
	@OnCrudEvent({ collection: WebhookCollection, type: "finish" })
	async __onWebhookChange(event: CrudFinishEvent): Promise<void> {
		if (event.action === "read") return
		this.allWebhooks = await this.repo.findWhere({ trx: event.trx })
	}

	/**
	 * Trigger event after create/update/delete request
	 */
	@OnCrudEvent({ type: "after" })
	async __fireWebhooks(event: CrudAfterEvent): Promise<void> {
		if (event.action === "read") return

		for (const webhook of this.allWebhooks) {
			// nothing if hook is disabled
			if (!webhook.enabled) continue

			// nothing if hook does not include this action (example is not update.posts)
			const webhookEvent = `${event.action}.${event.collection.authzKey}`
			if (!webhook.events.includes(webhookEvent)) continue

			// Don't wait for request to finish, and ignore errors
			await this.http.client
				.request({
					data: webhook.sendData
						? ({ records: event.result, event: webhookEvent } satisfies WebhookSentData)
						: {},
					method: webhook.httpMethod,
					url: webhook.url,
					headers: (webhook.httpHeaders ?? {}) as Struct<string>,
					// Cancel after 5 seconds
					timeout: 5000,
				})
				.catch(() => {
					// Ignore error. We don't want to prevent other hooks from firing if one fail
				})
		}
	}
}

type WebhookSentData = {
	event: string
	// it's deleted records when delete, updated in update, created in create.
	// for update it's after version
	records: Struct[]
}
