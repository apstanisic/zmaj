import { ConditionalPick, Opaque } from "type-fest"
import { BaseModel } from "../base-model"
import { ModelRelationDefinition } from "../relations/relation-metadata"
import { ExtractFields, ExtractReadFields } from "./extract-model-fields.types"
import { ExtractRelations } from "./extract-model-relations.type"

type BaseType<TModel extends BaseModel> = ExtractFields<TModel> & ExtractRelations<TModel>
type BaseReadType<TModel extends BaseModel> = ExtractReadFields<TModel> & ExtractRelations<TModel>

export type ModelType<
	TModel extends BaseModel,
	TRead extends "default" | "read" = "default",
> = TRead extends "read"
	? ModelReadType<TModel> //
	: Opaque<BaseType<TModel>, TModel>

export type ModelFields<TModel extends BaseModel> =
	| keyof TModel["fields"]
	| keyof ConditionalPick<TModel, ModelRelationDefinition<any>>

export type ModelReadType<TModel extends BaseModel> = Opaque<BaseReadType<TModel>, TModel>

export type ModelTypeWithHidden<
	TModel extends BaseModel,
	TShowHidden extends boolean = true,
> = TShowHidden extends true ? Opaque<BaseType<TModel>, TModel> : ModelReadType<TModel>
