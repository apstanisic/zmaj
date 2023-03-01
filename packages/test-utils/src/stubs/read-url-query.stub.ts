import { randBoolean, randNumber, randPhrase, randWord } from "@ngneat/falso"
import { Stub, UrlQuerySchema } from "@zmaj-js/common"
import { range } from "radash"

export const ReadUrlQueryStub = Stub(UrlQuerySchema, () => ({
	limit: randNumber({ min: 1, max: 100 }),
	page: randNumber({ min: 1, max: 10 }),
	count: randBoolean(),
	fields: {},
	filter: Object.fromEntries(
		range(0, 6, () => [randWord(), randPhrase()]), //
	), //
	sort: {},
	otmShowForbidden: false,
}))

export const FilterStub = Stub(() => {
	return Object.fromEntries(range(0, 6, () => [randWord(), randPhrase()])) //
})
