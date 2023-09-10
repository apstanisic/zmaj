import { ConditionalPick } from "type-fest"
import { BaseModel } from "../base-model"
import { RelationBuilderResult } from "../relations/relation-builder-result"

export type ModelPropertyKeys<TModel extends BaseModel> =
	| keyof TModel["fields"]
	| keyof ConditionalPick<TModel, RelationBuilderResult<any, any, any>>

export type ModelFieldKeys<TModel extends BaseModel> = keyof TModel["fields"]

export type ModelRelationKeys<TModel extends BaseModel> =
	| keyof ConditionalPick<TModel, RelationBuilderResult<any, any, any>>
