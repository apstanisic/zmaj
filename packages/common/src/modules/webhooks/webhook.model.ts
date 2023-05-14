import { Struct } from "@common/types"
import { BaseModel } from "@zmaj-js/orm-common"

export type Webhook = {
	url: string
	name: string
	createdAt: Date
	httpMethod: "POST" | "GET" | "PUT" | "PATCH" | "DELETE"
	id: string
	description: string | null
	// // It's possible to have hook, but not be used currently
	enabled: boolean
	// /** Http headers that will be sent with request */
	httpHeaders: Struct<string> | null
	// /**
	//  * Should we send data with a request (newData property on activity log)
	//  * Data will only be sent on post request
	//  */
	sendData: boolean
	// /** Can be empty, it's possible that it does not react on any event */
	events: readonly string[]
}

export class WebhookModel extends BaseModel {
	override name = "zmajWebhooks"
	override tableName = "zmaj_webhooks"

	override fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		createdAt: f.createdAt({}),
		url: f.text({}),
		name: f.text({}),
		httpMethod: f.enumString({ enum: ["POST", "GET", "PUT", "PATCH", "DELETE"] }),
		description: f.text({ nullable: true }),
		enabled: f.boolean({}),
		httpHeaders: f.json({ nullable: true }),
		events: f.array({}),
		/**
		 * Should we send data with a request (newData property on activity log)
		 * Data will only be sent on post request
		 */
		sendData: f.boolean({}),
	}))
}
