import { throw500 } from "@api/common/throw-http"
import { rand } from "@ngneat/falso"
import { Stub } from "@zmaj-js/common"
import {
	CrudAfterEvent,
	CrudBeforeEvent,
	CrudFinishEvent,
	CrudStartEvent,
} from "../crud-event.types"
import {
	CreateAfterEventStub,
	CreateBeforeEventStub,
	CreateFinishEventStub,
	CreateStartEventStub,
} from "./create-event.stubs"
import {
	DeleteAfterEventStub,
	DeleteBeforeEventStub,
	DeleteFinishEventStub,
	DeleteStartEventStub,
} from "./delete-event.stubs"
import {
	ReadAfterEventStub,
	ReadBeforeEventStub,
	ReadFinishEventStub,
	ReadStartEventStub,
} from "./read-event.stubs"
import {
	UpdateAfterEventStub,
	UpdateBeforeEventStub,
	UpdateFinishEventStub,
	UpdateStartEventStub,
} from "./update-event.stubs"

export const CrudBeforeEventStub = Stub<CrudBeforeEvent>(() => {
	const val = rand(["update", "read", "create", "delete"])
	switch (val) {
		case "update":
			return UpdateBeforeEventStub()
		case "delete":
			return DeleteBeforeEventStub()
		case "create":
			return CreateBeforeEventStub()
		case "read":
			return ReadBeforeEventStub()
		default:
			throw500(12378126312)
	}
})
export const CrudStartEventStub = Stub<CrudStartEvent>(() => {
	const val = rand(["update", "read", "create", "delete"])
	switch (val) {
		case "update":
			return UpdateStartEventStub()
		case "delete":
			return DeleteStartEventStub()
		case "create":
			return CreateStartEventStub()
		case "read":
			return ReadStartEventStub()
		default:
			throw500(42320432)
	}
})

export const CrudFinishEventStub = Stub<CrudFinishEvent>(() => {
	const val = rand(["update", "read", "create", "delete"])
	switch (val) {
		case "update":
			return UpdateFinishEventStub()
		case "delete":
			return DeleteFinishEventStub()
		case "create":
			return CreateFinishEventStub()
		case "read":
			return ReadFinishEventStub()
		default:
			throw500(9532423)
	}
})

export const CrudAfterEventStub = Stub<CrudAfterEvent>(() => {
	const val = rand(["update", "read", "create", "delete"])
	switch (val) {
		case "update":
			return UpdateAfterEventStub()
		case "delete":
			return DeleteAfterEventStub()
		case "create":
			return CreateAfterEventStub()
		case "read":
			return ReadAfterEventStub()
		default:
			throw500(598123)
	}
})
