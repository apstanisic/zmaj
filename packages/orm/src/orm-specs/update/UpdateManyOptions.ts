import { BaseModel, Filter, IdType, ModelType } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { GetUpdateType } from "./GetUpdateType"

export type UpdateManyOptions<
	TModel extends BaseModel,
	OverrideCanUpdate extends boolean,
> = BaseRepoMethodParams & {
	where: Filter<ModelType<TModel>> | IdType[] | IdType
	changes: GetUpdateType<TModel, OverrideCanUpdate>
	overrideCanUpdate?: OverrideCanUpdate
}
