import { BaseModel } from "@orm-engine/model/base-model"
import {
	ExtractFields,
	ExtractUpdateFields,
} from "@orm-engine/model/types/extract-model-fields.types"

/**
 * If override can create, we allow all fields, otherwise only that do not have `canUpdate: false`
 *
 *
 * If `TOverrideCanUpdate` is `true`
 * 	 we will take all fields and make them optional
 * If `TOverrideCanUpdate` is `false`
 *   we call special type that extracts fields that are allowed to be updated
 *
 */
export type GetUpdateType<
	TModel extends BaseModel,
	OverrideCanUpdate extends boolean,
> = OverrideCanUpdate extends true ? Partial<ExtractFields<TModel>> : ExtractUpdateFields<TModel>