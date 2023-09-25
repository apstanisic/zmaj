import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { Transaction } from "@zmaj-js/orm"
import { randNumber, randWord } from "@ngneat/falso"
import { stub, times } from "@zmaj-js/common"
import { CollectionDefStub, FilterStub } from "@zmaj-js/test-utils"
import { isObject, isString, omit, random } from "radash"
import { v4 } from "uuid"
import {
	DeleteAfterEvent,
	DeleteBeforeEvent,
	DeleteFinishEvent,
	DeleteStartEvent,
} from "../crud-event.types"

export const DeleteBeforeEventStub = stub<DeleteBeforeEvent<any>>((modify) => {
	const req = CrudRequestStub(modify.req)
	const collection = isString(req.collection)
		? CollectionDefStub({ collectionName: req.collection })
		: isObject(req.collection)
		? req.collection
		: CollectionDefStub()
	return {
		action: "delete",
		type: "before",
		user: req.user,
		req,
		collection,
		filter: { type: "where", where: FilterStub() },
	}
})

export const DeleteStartEventStub = stub<DeleteStartEvent<any>>((modify) => {
	const base = DeleteBeforeEventStub(omit(modify, ["type"]))
	const toDelete = times(random(1, 5), () => ({
		id: v4(),
		original: {
			id: v4(),
			name: randWord(),
			otherVal: randNumber(),
		},
	}))

	return {
		...base,
		type: "start",
		trx: {} as Transaction,
		toDelete,
	}
})

export const DeleteFinishEventStub = stub<DeleteFinishEvent<any>>((modify) => {
	const base = DeleteStartEventStub(omit(modify, ["type"]))

	return {
		...base,
		type: "finish",
		result: base.toDelete,
	}
})

export const DeleteAfterEventStub = stub<DeleteAfterEvent<any>>((modify) => {
	const base = DeleteFinishEventStub(omit(modify, ["type"]))

	return {
		...base,
		type: "after",
		trx: undefined,
	}
})
