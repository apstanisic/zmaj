import {
	rand,
	randBoolean,
	randColor,
	randCompanyName,
	randDirectoryPath,
	randHttpMethod,
	randPastDate,
	randProductCategory,
	randSentence,
	randWord,
} from "@ngneat/falso"
import { Webhook, WebhookSchema, stub } from "@zmaj-js/common"
import path from "path"
import { range } from "radash"
import { v4 } from "uuid"

export const WebhookStub = stub<Webhook>(
	() => ({
		description: randSentence(),
		enabled: randBoolean(),
		events: Array.from(
			range(1, 10, () => `${rand(["create", "update", "delete"])}.${randProductCategory()}`),
		),
		httpMethod: randHttpMethod() as never,
		name: randCompanyName(),
		sendData: randBoolean(),
		url: path.join(`https://${randColor()}.test`, randDirectoryPath()),
		createdAt: randPastDate({ years: 3 }),
		httpHeaders: Object.fromEntries(range(1, 4, () => [randWord(), randWord()])),
		id: v4(),
	}),
	WebhookSchema,
)
