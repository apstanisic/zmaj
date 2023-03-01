import { IdType, OnlyFields } from "@zmaj-js/common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

export type UpdateOneOptions<T> = BaseRepoMethodParams & {
	id: IdType
	changes: Partial<OnlyFields<T>>
}
