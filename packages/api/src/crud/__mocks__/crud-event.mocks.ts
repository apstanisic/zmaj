import { throw500 } from "@api/common/throw-http"
import { rand } from "@ngneat/falso"
import { stub } from "@zmaj-js/common"
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

export const CrudBeforeEventStub = stub<CrudBeforeEvent>((modify) => {
	// const val = modify.type ??
	const val: Partial<CrudBeforeEvent> = {
		...modify,
		action: modify.action ?? rand(["update", "read", "create", "delete"]),
	}
	// switch does not do type narrowing
	if (val.action === "update") {
		return UpdateBeforeEventStub(val)
	} else if (val.action === "create") {
		return CreateBeforeEventStub(val)
	} else if (val.action === "read") {
		return ReadBeforeEventStub(val)
	} else if (val.action === "delete") {
		return DeleteBeforeEventStub(val)
	} else {
		throw500(398999)
	}
})
export const CrudStartEventStub = stub<CrudStartEvent>((modify) => {
	// const val = modify.type ??
	const val: Partial<CrudStartEvent> = {
		...modify,
		action: modify.action ?? rand(["update", "read", "create", "delete"]),
	}
	// switch does not do type narrowing
	if (val.action === "update") {
		return UpdateStartEventStub(val)
	} else if (val.action === "create") {
		return CreateStartEventStub(val)
	} else if (val.action === "read") {
		return ReadStartEventStub(val)
	} else if (val.action === "delete") {
		return DeleteStartEventStub(val)
	} else {
		throw500(9391222)
	}
})

export const CrudFinishEventStub = stub<CrudFinishEvent>((modify) => {
	const val: Partial<CrudFinishEvent> = {
		...modify,
		action: modify.action ?? rand(["update", "read", "create", "delete"]),
	}
	// switch does not do type narrowing
	if (val.action === "update") {
		return UpdateFinishEventStub(val)
	} else if (val.action === "create") {
		return CreateFinishEventStub(val)
	} else if (val.action === "read") {
		return ReadFinishEventStub(val)
	} else if (val.action === "delete") {
		return DeleteFinishEventStub(val)
	} else {
		throw500(94432)
	}
})

export const CrudAfterEventStub = stub<CrudAfterEvent>((modify) => {
	const val: Partial<CrudAfterEvent> = {
		...modify,
		action: modify.action ?? rand(["update", "read", "create", "delete"]),
	}
	// switch does not do type narrowing
	if (val.action === "update") {
		return UpdateAfterEventStub(val)
	} else if (val.action === "create") {
		return CreateAfterEventStub(val)
	} else if (val.action === "read") {
		return ReadAfterEventStub(val)
	} else if (val.action === "delete") {
		return DeleteAfterEventStub(val)
	} else {
		throw500(94432)
	}
})
