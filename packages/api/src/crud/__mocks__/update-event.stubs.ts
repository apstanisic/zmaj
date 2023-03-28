import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { randBoolean, randPhrase, randWord } from "@ngneat/falso"
import { stub, times } from "@zmaj-js/common"
import { CollectionDefStub, FilterStub } from "@zmaj-js/test-utils"
import { isObject, isString, omit, random } from "radash"
import { v4 } from "uuid"
import {
	UpdateAfterEvent,
	UpdateBeforeEvent,
	UpdateFinishEvent,
	UpdateStartEvent,
} from "../crud-event.types"

export const UpdateBeforeEventStub = stub<UpdateBeforeEvent>((modify) => {
	const req = CrudRequestStub(modify.req)
	const collection = isString(req.collection)
		? CollectionDefStub({ collectionName: req.collection })
		: isObject(req.collection)
		? req.collection
		: CollectionDefStub()
	return {
		action: "update",
		type: "before",
		user: req.user,
		changes: Object.fromEntries(times(3, (i) => ["val" + i, randPhrase()])),
		filter: { type: "where", where: FilterStub() },
		req,
		collection,
	}
})

export const UpdateStartEventStub = stub<UpdateStartEvent>((modify) => {
	const base = UpdateBeforeEventStub(omit(modify, ["type"]))

	const toUpdate: UpdateStartEvent["toUpdate"] = times(random(1, 8), () => {
		const id = v4()
		const original = {
			id,
			name: randWord,
			someNumber: random(1, 1000),
			another: randBoolean(),
			someNull: null,
		}
		const changed = { ...original, ...base.changes }
		return { id, original, changed }
	})

	return {
		...base,
		type: "start",
		toUpdate,
		trx: {} as Transaction, //
	}
})

export const UpdateFinishEventStub = stub<UpdateFinishEvent>((modify) => {
	const base = UpdateStartEventStub(omit(modify, ["type"]))
	return {
		...base,
		type: "finish",
		result: base.toUpdate.map((item) => item.changed),
	}
})

export const UpdateAfterEventStub = stub<UpdateAfterEvent>((modify) => {
	const base = UpdateFinishEventStub(omit(modify, ["type"]))
	return {
		...base,
		type: "after",
		trx: undefined,
	}
})
