import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { randNumber, randWord } from "@ngneat/falso"
import { UrlQuerySchema, stub, times } from "@zmaj-js/common"
import { CollectionDefStub } from "@zmaj-js/test-utils"
import { isObject, isString, omit, random } from "radash"
import { v4 } from "uuid"
import {
	ReadAfterEvent,
	ReadBeforeEvent,
	ReadFinishEvent,
	ReadStartEvent,
} from "../crud-event.types"

export const ReadBeforeEventStub = stub<ReadBeforeEvent>((modify) => {
	const req = CrudRequestStub(modify.req)
	const collection = isString(req.collection)
		? CollectionDefStub({ collectionName: req.collection })
		: isObject(req.collection)
		? req.collection
		: CollectionDefStub()
	const query = UrlQuerySchema.parse(req.query)
	return {
		action: "read",
		type: "before",
		user: req.user,
		req,
		collection,
		filter: { type: "where", where: query.filter },
		options: query,
	}
})

export const ReadStartEventStub = stub<ReadStartEvent>((modify) => {
	const base = ReadBeforeEventStub(omit(modify, ["type"]))
	return {
		...base,
		type: "start",
		trx: {} as Transaction,
	}
})

export const ReadFinishEventStub = stub<ReadFinishEvent>((modify) => {
	const base = ReadStartEventStub(omit(modify, ["type"]))
	const result = times(random(0, 20), () => ({
		id: v4(),
		name: randWord(),
		someVal5: randNumber(),
	}))

	return {
		...base,
		type: "finish",
		result,
	}
})

export const ReadAfterEventStub = stub<ReadAfterEvent>((modify) => {
	const base = ReadFinishEventStub(omit(modify, ["type"]))
	return {
		...base,
		type: "after",
		trx: undefined,
	}
})
