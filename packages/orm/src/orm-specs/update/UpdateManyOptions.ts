import { Filter, IdType, OnlyFields } from "@zmaj-js/common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

export type UpdateManyOptions<T> = BaseRepoMethodParams & {
	where: Filter<T> | IdType[] | IdType
	changes: Partial<OnlyFields<T>>
	overrideCanUpdate?: boolean
}
