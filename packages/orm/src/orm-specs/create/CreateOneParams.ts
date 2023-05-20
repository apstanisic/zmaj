import { BaseModel } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { GetCreateType } from "./GetCreateType"

export type CreateOneParams<
	TModel extends BaseModel,
	OverrideCanCreate extends boolean,
> = BaseRepoMethodParams & {
	/**
	 * Entity data
	 */
	data: GetCreateType<TModel, OverrideCanCreate>

	overrideCanCreate?: OverrideCanCreate
}
