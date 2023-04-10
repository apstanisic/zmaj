import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { Transaction } from "@zmaj-js/orm"
import { randJSON, randNumber } from "@ngneat/falso"
import { stub, times } from "@zmaj-js/common"
import { CollectionDefStub } from "@zmaj-js/test-utils"
import { isObject, isString, omit } from "radash"
import {
	CreateAfterEvent,
	CreateBeforeEvent,
	CreateFinishEvent,
	CreateStartEvent,
} from "../crud-event.types"

export const CreateBeforeEventStub = stub<CreateBeforeEvent<any>>((modify) => {
	const req = CrudRequestStub(modify.req)
	const collection = isString(req.collection)
		? CollectionDefStub({ collectionName: req.collection })
		: isObject(req.collection)
		? req.collection
		: CollectionDefStub()

	return {
		action: "create",
		type: "before",
		user: req.user,
		req,
		collection,
		dto: times(randNumber({ min: 1, max: 5 }), (i) => randJSON({ totalKeys: 3 })),
	}
})

export const CreateStartEventStub = stub<CreateStartEvent<any>>((modify) => {
	const base = CreateBeforeEventStub(omit(modify, ["type"]))

	return {
		...base,
		type: "start",
		trx: {} as Transaction,
	}
})

export const CreateFinishEventStub = stub<CreateFinishEvent<any>>((modify) => {
	const base = CreateStartEventStub(omit(modify, ["type"]))

	return {
		...base,
		type: "finish",
		result: base.dto.map((item, i) => ({ id: i + 55, ...item })),
	}
})

export const CreateAfterEventStub = stub<CreateAfterEvent<any>>((modify) => {
	const base = CreateFinishEventStub(omit(modify, ["type"]))

	return {
		...base,
		type: "after",
		trx: undefined,
	}
})
