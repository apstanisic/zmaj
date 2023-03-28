import { randBoolean, randNumber, randPhrase, randWord } from "@ngneat/falso"
import { Filter, Struct, UrlQuery, UrlQuerySchema, stub, times } from "@zmaj-js/common"

export const ReadUrlQueryStub = stub<UrlQuery>(
	() => ({
		limit: randNumber({ min: 1, max: 100 }),
		page: randNumber({ min: 1, max: 10 }),
		count: randBoolean(),
		fields: {},
		filter: Object.fromEntries(
			times(6, () => [randWord(), randPhrase()]), //
		),
		sort: {},
		otmShowForbidden: false,
		cursor: undefined,
		language: undefined,
		mtmCollection: undefined,
		mtmProperty: undefined,
		mtmRecordId: undefined,
		otmFkField: undefined,
	}),
	UrlQuerySchema,
)

export const FilterStub = stub<Filter<Struct>>(() => {
	return Object.fromEntries(times(6, () => [randWord(), randPhrase()])) //
})
