import { BaseModel } from "@orm-engine/model/base-model"
import {
	ExtractCreateFields,
	ExtractCreateFieldsOverride,
} from "@orm-engine/model/types/extract-model-fields.types"

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
> = TOverrideCanCreate extends true
	? ExtractCreateFieldsOverride<TModel>
	: ExtractCreateFields<TModel>
