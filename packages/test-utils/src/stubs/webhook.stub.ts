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
import { Stub, WebhookSchema } from "@zmaj-js/common"
import path from "path"
import { range } from "radash"

export const WebhookStub = Stub(WebhookSchema, () => ({
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
}))
