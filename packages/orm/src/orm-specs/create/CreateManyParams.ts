import { BaseModel } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { GetCreateType } from "./GetCreateType"

export type CreateManyParams<
	TModel extends BaseModel,
	OverrideCanCreate extends boolean,
> = BaseRepoMethodParams & {
	/**
	 * Array of entities to be created
	 */
	data: readonly GetCreateType<TModel, OverrideCanCreate>[]

	overrideCanCreate?: OverrideCanCreate
}
