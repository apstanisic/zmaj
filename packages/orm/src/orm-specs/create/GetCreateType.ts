import { BaseModel, ModelCreateType, ModelFieldsType } from "@zmaj-js/orm-common"

export type GetCreateType<
	TModel extends BaseModel,
	OverrideCanCreate extends boolean,
> = OverrideCanCreate extends true ? Partial<ModelFieldsType<TModel>> : ModelCreateType<TModel>
