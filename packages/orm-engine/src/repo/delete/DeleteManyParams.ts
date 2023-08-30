import { BaseModel } from "@orm-engine/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { RepoWhere } from "../repo-where.type"

export type DeleteManyParams<TModel extends BaseModel> = BaseRepoMethodParams & {
	/**
	 * Filter to delete files
	 */
	where: RepoWhere<TModel>
}
