import { now } from "@common/utils/now"
import { v4 } from "uuid"
import { z } from "zod"

export const WebhookSchema = z.object({
	id: z.string().uuid().default(v4),
	url: z.string().url(),
	name: z.string().min(1).max(200).default("Webhook"),
	createdAt: z.date().default(now),
	description: z.string().nullable().default(null),
	enabled: z.boolean().default(false),
	sendData: z.boolean().default(false),
	httpMethod: z.enum(["POST", "GET", "PUT", "PATCH", "DELETE"]).default("GET"),
	events: z.array(z.string().min(1).max(100)).default([]),
	httpHeaders: z
		.record(z.string())
		.nullable()
		.default({})
		.transform((v) => (v !== null ? v : {})),
})

// const defaultFn = () => ({ id: "" })

// const WebhookSchemaWithDefault = z
// 	.record(z.unknown())
// 	.transform((v) => ({ ...defaultFn(), ...v }))
// 	.pipe(WebhookSchema)
// z.preprocess((v) => {})
// WebhookSchema.

// function schemaDefault<T, R extends Partial<T>>(schema: z.ZodType<T>, fn: () => R): () => R {
// 	return fn
// }

// function full<T, R extends Partial<T>>(params: {
// 	schema: z.ZodType<T>
// 	def: () => R
// }) {
// 	return {
// 		create: (params) {
// 			//
// 		}
// 	}
// }

// full({
// 	schema: WebhookSchema,
// 	def: () => ({
// 		id: v4(),
// 		name: "Webhook",
// 		enabled: false,
// 		sendData: false,
// 		httpMethod: "GET" as const,
// 		events: [],
// 		httpHeaders: {},
// 		createdAt: new Date(),
// 		description: null,
// 	}),
// })

// const WebhookDefault = schemaDefault(WebhookSchema, () => ({
// 	id: v4(),
// 	name: "Webhook",
// 	enabled: false,
// 	sendData: false,
// 	httpMethod: "GET" as const,
// 	events: [],
// 	httpHeaders: {},
// 	createdAt: new Date(),
// 	description: null,
// }))

// zodCreate(WebhookSchema, { ...WebhookDefault(), url: "test" })
