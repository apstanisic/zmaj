import { CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { randBoolean, randIp, randNumber, randUserAgent, randWord } from "@ngneat/falso"
import { Stub, times } from "@zmaj-js/common"
import { AuthUserStub, ReadUrlQueryStub } from "@zmaj-js/test-utils"

export const CrudRequestStub = Stub<CrudRequest>(() => {
	const table = randWord()
	return {
		user: randBoolean() ? AuthUserStub() : undefined,
		ip: randIp(),
		userAgent: randUserAgent(),
		collection: table,
		// flags: {},
		params: { table },
		body: Object.fromEntries(times(randNumber({ min: 1, max: 6 }), () => [randWord(), randWord()])),
		query: ReadUrlQueryStub(),
		isCrudRequest: true,
	}
})
