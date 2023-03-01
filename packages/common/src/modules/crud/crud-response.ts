import { PartialDeep } from "type-fest"
import { IdRecord } from "../../types/id-record.type"
import { IdType } from "../crud-types/id-type.type"

export type CrudResponse<T extends { id: IdType } = IdRecord<any>> = {
	// data: IdRecord<T>[]
	data: PartialDeep<T>[]
}
