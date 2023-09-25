import { BaseModel } from "@orm/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { IdType } from "../id-type.type"

/**
 * TODO: Add support to extract PK type
 */
export type DeleteByIdParams<TModel extends BaseModel> = BaseRepoMethodParams & {
	/**
	 * Primary key of entity that will be deleted
	 */
	id: IdType
}
