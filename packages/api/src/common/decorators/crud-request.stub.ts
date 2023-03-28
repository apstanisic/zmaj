import { CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { randBoolean, randIp, randNumber, randUserAgent, randWord } from "@ngneat/falso"
import { stub, times } from "@zmaj-js/common"
import { AuthUserStub, ReadUrlQueryStub } from "@zmaj-js/test-utils"
import { isObject, isString } from "radash"

export const CrudRequestStub = stub<CrudRequest>(({ collection }) => {
	const collectionName = isString(collection)
		? collection
		: isObject(collection)
		? collection.collectionName
		: randWord()
	return {
		user: randBoolean() ? AuthUserStub() : undefined,
		ip: randIp(),
		userAgent: randUserAgent(),
		collection: collection ?? collectionName,
		params: { collection: collectionName },
		body: Object.fromEntries(times(randNumber({ min: 1, max: 6 }), () => [randWord(), randWord()])),
		query: ReadUrlQueryStub(),
		isCrudRequest: true,
	}
})
