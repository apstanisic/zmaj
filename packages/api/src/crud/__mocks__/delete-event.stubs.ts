import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { randNumber, randWord } from "@ngneat/falso"
import { Stub, times } from "@zmaj-js/common"
import { FilterStub, CollectionDefStub } from "@zmaj-js/test-utils"
import { random } from "radash"
import { v4 } from "uuid"
import {
	DeleteAfterEvent,
	DeleteBeforeEvent,
	DeleteFinishEvent,
	DeleteStartEvent,
} from "../crud-event.types"

export const DeleteBeforeEventStub = Stub<DeleteBeforeEvent<any>>(() => {
	const req = CrudRequestStub()
	return {
		action: "delete",
		type: "before",
		user: req.user,
		req,
		collection: CollectionDefStub(),
		filter: { type: "where", where: FilterStub() },
	}
})

export const DeleteStartEventStub = Stub<DeleteStartEvent<any>>(() => {
	const base = DeleteBeforeEventStub()
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

export const DeleteFinishEventStub = Stub<DeleteFinishEvent<any>>(() => {
	const base = DeleteStartEventStub()

	return {
		...base,
		type: "finish",
		result: base.toDelete,
	}
})

export const DeleteAfterEventStub = Stub<DeleteAfterEvent<any>>(() => {
	const base = DeleteFinishEventStub()

	return {
		...base,
		type: "after",
		trx: undefined,
	}
})
