import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { randNumber, randWord } from "@ngneat/falso"
import { Stub, times, UrlQuerySchema } from "@zmaj-js/common"
import { CollectionDefStub } from "@zmaj-js/test-utils"
import { random } from "radash"
import { v4 } from "uuid"
import {
	ReadAfterEvent,
	ReadBeforeEvent,
	ReadFinishEvent,
	ReadStartEvent,
} from "../crud-event.types"

export const ReadBeforeEventStub = Stub<ReadBeforeEvent>(() => {
	const req = CrudRequestStub()
	const query = UrlQuerySchema.parse(req.query)
	return {
		action: "read",
		type: "before",
		user: req.user,
		req,
		collection: CollectionDefStub(),
		filter: { type: "where", where: query.filter },
		options: query,
	}
})

export const ReadStartEventStub = Stub<ReadStartEvent>(() => {
	const base = ReadBeforeEventStub()
	return {
		...base,
		type: "start",
		trx: {} as Transaction,
	}
})

export const ReadFinishEventStub = Stub<ReadFinishEvent>(() => {
	const base = ReadStartEventStub()
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

export const ReadAfterEventStub = Stub<ReadAfterEvent>(() => {
	const base = ReadFinishEventStub()
	return {
		...base,
		type: "after",
		trx: undefined,
	}
})
