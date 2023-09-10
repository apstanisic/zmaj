import { ConditionalPick } from "type-fest"
import { BaseModel } from "../base-model"
import { RelationBuilderResult } from "../relations/relation-builder-result"

export type ModelPropertyKeys<TModel extends BaseModel> =
	| keyof TModel["fields"]
	| keyof ConditionalPick<TModel, RelationBuilderResult<any, any, any>>
