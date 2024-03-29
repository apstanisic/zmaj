import { IdType } from "@zmaj-js/orm"
import { PartialDeep } from "type-fest"
import { IdRecord } from "../../types/id-record.type"

export type CrudResponse<T extends { id: IdType } = IdRecord<any>> = {
	// data: IdRecord<T>[]
	data: PartialDeep<T>[]
}
