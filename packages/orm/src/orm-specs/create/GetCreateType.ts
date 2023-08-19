import { BaseModel, ModelCreateType, ModelFieldsType } from "@zmaj-js/orm-common"

/**
 * This is needed data to create row in DB.
 *
 * If `TOverrideCanCreate` is `true`
 * 	 we will take all fields and make them optional
 * If `TOverrideCanCreate` is `false`
 *   we call special type that extracts fields that are allowed to be created
 *
 * TODO Use `hasDefault` property to further strict this data
 *
 */
export type GetCreateType<
	TModel extends BaseModel,
	TOverrideCanCreate extends boolean,
> = TOverrideCanCreate extends true ? Partial<ModelFieldsType<TModel>> : ModelCreateType<TModel>
