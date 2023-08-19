import { BaseModel } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { Where } from "../where.type"
import { GetUpdateType } from "./GetUpdateType"

/**
 * Props that are passed to update many method
 */
export type UpdateManyOptions<
	TModel extends BaseModel,
	OverrideCanUpdate extends boolean,
> = BaseRepoMethodParams & {
	where: Where<TModel>
	changes: GetUpdateType<TModel, OverrideCanUpdate>
	overrideCanUpdate?: OverrideCanUpdate
}
