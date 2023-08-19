import { BaseModel, Filter, IdType, ModelType } from "@zmaj-js/orm-common"

export type Where<TModel extends BaseModel> = Filter<ModelType<TModel>> | IdType[] | IdType
