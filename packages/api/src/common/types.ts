import { Struct } from "@zmaj-js/common"
import { PartialDeep } from "type-fest"
import { CrudRequest } from "./decorators/crud-request.decorator"

/**
 * Augment express's request with parsed and validated params, body, query
 * I do not know if I need this, but I feel more type-safe
 */
declare module "express" {
	export interface Request {
		parsedBody: Struct
		parsedQuery: Struct
		parsedParams: Struct<string>
	}
}

export type ResponseWithCount<T = Struct> = {
	data: PartialDeep<T>[]
	count?: number
}

export type CrudController<Item extends Struct<any> = Struct<any>> = {
	findById: (req: CrudRequest) => Promise<PartialDeep<Item>>
	findMany: (req: CrudRequest) => Promise<ResponseWithCount<Item>>
	createOne: (req: CrudRequest, dto?: any) => Promise<PartialDeep<Item>>
	updateById: (req: CrudRequest, dto?: any) => Promise<PartialDeep<Item>>
	deleteById: (req: CrudRequest) => Promise<PartialDeep<Item>>
}

export type RedirectResponse = { url: string; statusCode: number }

export type Fields<T = unknown> = {
	[key: string]: Fields | true
}

export type Filter<T = unknown> = Struct<any>
