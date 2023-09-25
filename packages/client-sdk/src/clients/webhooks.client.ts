import { endpoints, WebhookModel } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class WebhooksClient extends CrudClient<WebhookModel> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.webhooks.$base)
	}
}
