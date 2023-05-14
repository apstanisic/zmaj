import { Filter, IdType } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

export type DeleteManyParams<T> = BaseRepoMethodParams & {
	/**
	 * Filter to delete files
	 */
	where: Filter<T> | IdType[] | IdType
}
