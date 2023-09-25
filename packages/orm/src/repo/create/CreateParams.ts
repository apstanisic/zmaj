import { BaseModel } from "@orm/model/base-model"
import { GetCreateFields } from "@orm/model/types/get-model-fields.types"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

/**
 * This is needed params in repo's create method
 */
export type CreateParams<
	// Model
	TModel extends BaseModel,
	// Override fields that contain `canCreate: false`
	TOverrideCanCreate extends boolean,
	// Are we creating one item or many
	TType extends "one" | "many",
> = BaseRepoMethodParams & {
	/**
	 * Data that needs to be provided to create item
	 */
	data: TType extends "one"
		? GetCreateFields<TModel, TOverrideCanCreate>
		: GetCreateFields<TModel, TOverrideCanCreate>[]

	overrideCanCreate?: TOverrideCanCreate
}
