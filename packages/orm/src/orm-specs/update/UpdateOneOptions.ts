import { IdType, OnlyFields } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

export type UpdateOneOptions<T> = BaseRepoMethodParams & {
	id: IdType
	changes: Partial<OnlyFields<T>>
}
