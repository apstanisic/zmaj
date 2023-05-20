import { BaseModel, ModelFieldsType, ModelUpdateType } from "@zmaj-js/orm-common"

export type GetUpdateType<
	TModel extends BaseModel,
	OverrideCanUpdate extends boolean,
> = OverrideCanUpdate extends true ? Partial<ModelFieldsType<TModel>> : ModelUpdateType<TModel>
