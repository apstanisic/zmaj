import { BaseModel } from "@orm-engine/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { RepoFilter } from "../filter/repo-filter.type"

export type DeleteManyParams<TModel extends BaseModel> = BaseRepoMethodParams & {
	/**
	 * Filter to delete files
	 */
	where: RepoFilter<TModel>
}
