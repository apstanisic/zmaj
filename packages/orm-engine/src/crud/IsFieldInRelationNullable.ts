import { BaseModel } from "@orm-engine/model/base-model"
import { ModelRelationDefinition } from "@orm-engine/model/relations/relation-metadata"
import { RelationType } from "@orm-engine/model/relations/relation.type"

export type IsFieldInRelationNullable<TKey, TModel extends BaseModel> = TKey extends keyof TModel
	? TModel[TKey] extends ModelRelationDefinition<any, any, infer FKey>
		? FKey extends string
			? FKey extends keyof TModel["fields"]
				? TModel["fields"][FKey]["_nullable"] extends true
					? undefined
					: never
				: never
			: never
		: never
	: never

export type IsRefOneToOne<TRelType extends RelationType> = TRelType extends "ref-one-to-one"
	? undefined
	: never
