import { BaseModel, IdType } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

/**
 * TODO: Add support to extract PK type
 */
export type DeleteByIdParams<TModel extends BaseModel> = BaseRepoMethodParams & {
	/**
	 * Primary key of entity that will be deleted
	 */
	id: IdType
}
