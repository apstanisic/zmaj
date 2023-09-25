import { BaseModel } from "@orm/model/base-model"
import { IdType } from "../id-type.type"
import { RepoFilterWhere } from "./repo-filter-where.type"

export type RepoFilter<TModel extends BaseModel> = RepoFilterWhere<TModel> | IdType[] | IdType
