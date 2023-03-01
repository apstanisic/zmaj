import {
	rand,
	randBoolean,
	randColor,
	randCompanyName,
	randDirectoryPath,
	randHttpMethod,
	randNumber,
	randPastDate,
	randProductCategory,
	randSentence,
	randWord,
} from "@ngneat/falso"
import { Stub, times, WebhookSchema } from "@zmaj-js/common"
import path from "path"

export const WebhookStub = Stub(WebhookSchema, () => ({
	description: randSentence(),
	enabled: randBoolean(),
	events: times(10, () => `${rand(["create", "update", "delete"])}.${randProductCategory()}`),
	httpMethod: randHttpMethod() as never,
	name: randCompanyName(),
	sendData: randBoolean(),
	url: path.join(`https://${randColor()}.test`, randDirectoryPath()),
	createdAt: randPastDate({ years: 3 }),
	httpHeaders: Object.fromEntries(
		times(
			randNumber({ min: 0, max: 4 }),
			() => [randWord(), randWord()], //
		),
	),
}))
