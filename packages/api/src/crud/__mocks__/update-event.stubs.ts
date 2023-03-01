import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { randBoolean, randPhrase, randWord } from "@ngneat/falso"
import { Stub, times } from "@zmaj-js/common"
import { FilterStub, CollectionDefStub } from "@zmaj-js/test-utils"
import { random } from "radash"
import { v4 } from "uuid"
import {
	UpdateAfterEvent,
	UpdateBeforeEvent,
	UpdateFinishEvent,
	UpdateStartEvent,
} from "../crud-event.types"

export const UpdateBeforeEventStub = Stub<UpdateBeforeEvent>(() => {
	const req = CrudRequestStub()
	return {
		action: "update",
		type: "before",
		user: req.user,
		changes: Object.fromEntries(times(3, (i) => ["val" + i, randPhrase()])),
		filter: { type: "where", where: FilterStub() },
		req: req,
		collection: CollectionDefStub(),
	}
})

export const UpdateStartEventStub = Stub<UpdateStartEvent>(() => {
	const base = UpdateBeforeEventStub()

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

export const UpdateFinishEventStub = Stub<UpdateFinishEvent>(() => {
	const base = UpdateStartEventStub()
	return {
		...base,
		type: "finish",
		result: base.toUpdate.map((item) => item.changed),
	}
})

export const UpdateAfterEventStub = Stub<UpdateAfterEvent>(() => {
	const base = UpdateFinishEventStub()
	return {
		...base,
		type: "after",
		trx: undefined,
	}
})
