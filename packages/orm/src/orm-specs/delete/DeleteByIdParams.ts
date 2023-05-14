import { IdType } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

export type DeleteByIdParams = BaseRepoMethodParams & {
	/**
	 * Primary key of entity that will be deleted
	 */
	id: IdType
}
