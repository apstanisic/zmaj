import { CrudFilter } from "@orm-engine/crud/crud-filter.type"
import { BaseModel } from "@orm-engine/model/base-model"
import { IdType } from "./id-type.type"

export type RepoWhere<TModel extends BaseModel> = CrudFilter<TModel> | IdType[] | IdType
