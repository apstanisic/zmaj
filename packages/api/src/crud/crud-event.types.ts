import { CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { AuthUser, CollectionDef, Struct, UrlQuery, UrlQuerySchema } from "@zmaj-js/common"
import { IdType, Transaction } from "@zmaj-js/orm"
import { ReadonlyDeep, SetRequired } from "type-fest"
import { ZodSchema, z } from "zod"

type Result<T = Struct> = { result: T[] }
type RequiredTrx = { readonly trx: Transaction }
type Filter = {
	filter:
		| { type: "id"; id: IdType }
		| { type: "ids"; ids: IdType[] }
		| { type: "where"; where: Struct }
}

///
/// Direct Params
///

export type SharedParams<T extends Struct = Struct> = {
	collection: string | CollectionDef
	user?: AuthUser
	trx?: Transaction
	// make this optional
	// just require ip and userAgent (ua optional)
	// req: CrudRequest
	req: SetRequired<Partial<CrudRequest>, "ip">
}

export type CrudReadParams<T extends Struct = Struct> = SharedParams<T> &
	Filter & { options?: z.input<typeof UrlQuerySchema> }
export type CrudUpdateParams<T extends Struct = Struct> = SharedParams<T> & Changes & Filter
export type CrudDeleteParams<T extends Struct = Struct> = SharedParams<T> & Filter
export type CrudCreateParams<T extends Struct = Struct> = SharedParams<T> & {
	dto: Struct | Struct[]
	factory?:
		| ZodSchema<Partial<T>, any, Struct> //
		| ((params: Struct) => Partial<T> | Promise<Partial<T>>)
	overrideCanCreate?: boolean
}

///
///
///
///

type BaseEvent<T extends Struct = Struct<any>> = {
	readonly type: "before" | "start" | "finish" | "after"
	readonly action: "create" | "update" | "delete" | "read"
	readonly trx?: Transaction
	readonly req: SetRequired<Partial<CrudRequest>, "ip">
	collection: CollectionDef
	resMeta?: Struct
	//
	// authz?: { resource: string; action: string }
	user?: AuthUser
}

///
/// Action
///
type ReadAction = { action: "read" }
type UpdateAction = { action: "update" }
type CreateAction = { action: "create" }
type DeleteAction = { action: "delete" }

///
/// Event types
///
type BeforeType = { type: "before" }
type StartType = { type: "start" } & RequiredTrx
type FinishType = { type: "finish" } & RequiredTrx
type AfterType = { type: "after" }

/// UPDATE
///
///

type Changes = { changes: Struct }
// type ToUpdate<T> = { readonly toUpdate: readonly Readonly<T>[]; withChanges: T[] }

type UpdateItem<T extends Struct = Struct> = {
	readonly id: IdType
	readonly original: Readonly<T>
	changed: Partial<T>
}

type ToUpdate<T extends Struct = Struct> = {
	toUpdate: UpdateItem<T>[]
}
type CrudUpdateEvent<T extends Struct = Struct> = BaseEvent<T> & UpdateAction & Changes & Filter
export type UpdateBeforeEvent<T extends Struct = Struct> = CrudUpdateEvent<T> & BeforeType
export type UpdateStartEvent<T extends Struct = Struct> = CrudUpdateEvent<T> &
	StartType &
	ToUpdate<T>
export type UpdateFinishEvent<T extends Struct = Struct> = CrudUpdateEvent<T> &
	FinishType &
	ToUpdate<T> &
	Result<T>
export type UpdateAfterEvent<T extends Struct = Struct> = CrudUpdateEvent<T> &
	AfterType &
	ToUpdate<T> &
	Result<T>

/// DELETE
///
///
type ToDelete<T> = { toDelete: ReadonlyDeep<{ original: T; id: IdType }>[] }
export type CrudDeleteEvent<T extends Struct> = BaseEvent<T> & DeleteAction & Filter
export type DeleteBeforeEvent<T extends Struct = Struct> = CrudDeleteEvent<T> & BeforeType
export type DeleteStartEvent<T extends Struct = Struct> = CrudDeleteEvent<T> &
	StartType &
	ToDelete<T>
export type DeleteFinishEvent<T extends Struct = Struct> = CrudDeleteEvent<T> &
	FinishType &
	Result<T> &
	ToDelete<T>
export type DeleteAfterEvent<T extends Struct = Struct> = CrudDeleteEvent<T> &
	AfterType &
	Result<T> &
	ToDelete<T>

/// CREATE
///
///
type Dto = { dto: Struct[] }
export type CrudCreateEvent<T extends Struct = Struct> = BaseEvent<T> & CreateAction & Dto
// type ToCreate<T> = { toCreate: T[] }
export type CreateBeforeEvent<T extends Struct = Struct> = CrudCreateEvent<T> & BeforeType
export type CreateStartEvent<T extends Struct = Struct> = CrudCreateEvent<T> & StartType
export type CreateFinishEvent<T extends Struct = Struct> = CrudCreateEvent<T> &
	FinishType &
	Result<T>
export type CreateAfterEvent<T extends Struct = Struct> = CrudCreateEvent<T> & AfterType & Result<T>

/// READ
///
///
type Count = { count?: number }
export type CrudReadEvent<T extends Struct = Struct> = BaseEvent<T> &
	ReadAction &
	Filter & { options: UrlQuery }
export type ReadBeforeEvent<T extends Struct = Struct> = CrudReadEvent<T> & BeforeType
export type ReadStartEvent<T extends Struct = Struct> = CrudReadEvent<T> & StartType
export type ReadFinishEvent<T extends Struct = Struct> = CrudReadEvent<T> &
	FinishType &
	Result<T> &
	Count
export type ReadAfterEvent<T extends Struct = Struct> = CrudReadEvent<T> &
	AfterType &
	Result<T> &
	Count

///
/// Before
///
export type CrudBeforeEvent<T extends Struct = Struct> =
	| UpdateBeforeEvent<T>
	| CreateBeforeEvent<T>
	| DeleteBeforeEvent<T>
	| ReadBeforeEvent<T>

///
/// Start
///
export type CrudStartEvent<T extends Struct = Struct> =
	| UpdateStartEvent<T>
	| CreateStartEvent
	| DeleteStartEvent<T>
	| ReadStartEvent

///
/// Finish event
///
export type CrudFinishEvent<T extends Struct = Struct> =
	| UpdateFinishEvent<T>
	| CreateFinishEvent<T>
	| DeleteFinishEvent<T>
	| ReadFinishEvent<T>

///
/// After event
///
export type CrudAfterEvent<T extends Struct = Struct> =
	| UpdateAfterEvent<T>
	| CreateAfterEvent<T>
	| DeleteAfterEvent<T>
	| ReadAfterEvent<T>
