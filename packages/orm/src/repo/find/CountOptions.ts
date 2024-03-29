import { BaseModel } from "@orm/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { RepoFilter } from "../filter/repo-filter.type"

export type CountOptions<TModel extends BaseModel> = BaseRepoMethodParams & {
	where?: RepoFilter<TModel>
}
