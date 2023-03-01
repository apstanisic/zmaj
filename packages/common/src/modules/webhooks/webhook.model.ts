import { Struct } from "@common/types"

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
