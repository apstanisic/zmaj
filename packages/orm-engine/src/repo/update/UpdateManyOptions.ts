import { BaseModel } from "@orm-engine/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { RepoWhere } from "../repo-where.type"
import { GetUpdateType } from "./GetUpdateType"

/**
 * Props that are passed to update many method
 */
export type UpdateManyOptions<
	TModel extends BaseModel,
	OverrideCanUpdate extends boolean,
> = BaseRepoMethodParams & {
	where: RepoWhere<TModel>
	changes: GetUpdateType<TModel, OverrideCanUpdate>
	overrideCanUpdate?: OverrideCanUpdate
}
