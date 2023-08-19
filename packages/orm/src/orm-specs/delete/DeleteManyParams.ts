import { BaseModel } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { Where } from "../where.type"

export type DeleteManyParams<TModel extends BaseModel> = BaseRepoMethodParams & {
	/**
	 * Filter to delete files
	 */
	where: Where<TModel>
}
