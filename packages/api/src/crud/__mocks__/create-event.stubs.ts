import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { randJSON, randNumber } from "@ngneat/falso"
import { Stub, times } from "@zmaj-js/common"
import { CollectionDefStub } from "@zmaj-js/test-utils"
import {
	CreateAfterEvent,
	CreateBeforeEvent,
	CreateFinishEvent,
	CreateStartEvent,
} from "../crud-event.types"

export const CreateBeforeEventStub = Stub<CreateBeforeEvent<any>>(() => {
	const req = CrudRequestStub()
	return {
		action: "create",
		type: "before",
		user: req.user,
		req,
		collection: CollectionDefStub(),
		dto: times(randNumber({ min: 1, max: 5 }), (i) => randJSON({ totalKeys: 3 })),
	}
})

export const CreateStartEventStub = Stub<CreateStartEvent<any>>(() => {
	const base = CreateBeforeEventStub()

	return {
		...base,
		type: "start",
		trx: {} as Transaction,
	}
})

export const CreateFinishEventStub = Stub<CreateFinishEvent<any>>(() => {
	const base = CreateStartEventStub()

	return {
		...base,
		type: "finish",
		result: base.dto.map((item, i) => ({ id: i + 55, ...item })),
	}
})

export const CreateAfterEventStub = Stub<CreateAfterEvent<any>>(() => {
	const base = CreateFinishEventStub()

	return {
		...base,
		type: "after",
		trx: undefined,
	}
})
