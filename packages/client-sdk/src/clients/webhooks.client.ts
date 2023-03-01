import { endpoints, Webhook, WebhookCreateDto, WebhookUpdateDto } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class WebhooksClient extends CrudClient<Webhook, WebhookCreateDto, WebhookUpdateDto> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.webhooks.$base)
	}
}
