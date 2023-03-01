// import { Filter } from "@common/find"
// import { Struct } from "@common/types"
// import { EntityRefVariants } from "./fields.type"
import { z } from "zod"
import { UrlQuerySchemaStrict } from "./url-query.schema"

export type UrlQuery = z.infer<typeof UrlQuerySchemaStrict>
export type GetManyOptions = z.input<typeof UrlQuerySchemaStrict>

// export type FieldsI<T> = {
// 	// if fields is relation, get inner type (strip EntityRef)
// 	[key in keyof Partial<T>]: T[key] extends EntityRefVariants<infer R> //
// 		? // and allow subfields or `true`
// 		  UrlQueryI<R> | true
// 		: // otherwise only allow `true`
// 		  true
// }

// export type UrlQueryI<T> = {
// 	cursor?: string
// 	limit?: number
// 	// offset: string
// 	page?: number
// 	count?: boolean
// 	language?: string
// 	sort?: Struct<string>
// 	fields?: FieldsI<T>
// 	filter?: Filter<T>
// 	// M2M
// 	mtmCollection?: string
// 	mtmProperty?: string
// 	mtmRecordId?: string | number
// 	// O2M
// 	// this field is used so we can provide users only records that they are allowed to update.
// 	// API can return correct values without this field, if filter is correct
// 	otmFkField?: string
// 	// Should we provide records to O2M input that can't be updated (user does not have permission)
// 	otmShowForbidden?: boolean
// }
