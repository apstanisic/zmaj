import { Opaque } from "type-fest"
import { BaseModel } from "../base-model"
import { ExtractFields } from "./extract-model-fields.types"
import { ExtractRelations } from "./extract-model-relations.type"

type BaseType<TModel extends BaseModel> = ExtractFields<TModel> & ExtractRelations<TModel>

export type ModelType<TModel extends BaseModel> = Opaque<BaseType<TModel>, TModel>
