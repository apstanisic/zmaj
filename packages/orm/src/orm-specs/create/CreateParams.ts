import { BaseModel } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { GetCreateType } from "./GetCreateType"

/**
 * This is needed params in repo's create method
 */
export type CreateParams<
	// Model
	TModel extends BaseModel,
	// Override fields that contain `canCreate: false`
	OverrideCanCreate extends boolean,
	// Are we creating one item or many
	TType extends "one" | "many",
> = BaseRepoMethodParams & {
	/**
	 * Data that needs to be provided to create item
	 */
	data: TType extends "one"
		? GetCreateType<TModel, OverrideCanCreate>
		: GetCreateType<TModel, OverrideCanCreate>[]

	overrideCanCreate?: OverrideCanCreate
}
