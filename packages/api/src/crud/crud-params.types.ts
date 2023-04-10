import { CrudRequest } from "@api/common/decorators/crud-request.type"
import { Transaction } from "@zmaj-js/orm"
import { AuthUser, CollectionDef, IdType, Struct, UrlQuery } from "@zmaj-js/common"

type CommonParams<T extends Struct = Struct> = {
	collection: string | CollectionDef<T>
	user?: AuthUser
	trx?: Transaction
	req: CrudRequest
}

type Filter = {
	filter?:
		| { type: "id"; id: IdType }
		| { type: "ids"; ids: IdType[] }
		| { type: "where"; where: Struct }
}

export type CrudReadParams2<T extends Struct = Struct> = CommonParams<T> &
	Filter & {
		options?: UrlQuery
	}
