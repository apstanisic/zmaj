import { BaseModel } from "@orm-engine/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { RepoWhere } from "../repo-where.type"

export type CountOptions<TModel extends BaseModel> = BaseRepoMethodParams & {
	where?: RepoWhere<TModel>
}
