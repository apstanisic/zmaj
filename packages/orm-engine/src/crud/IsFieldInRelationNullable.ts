import { BaseModel } from "@orm-engine/model/base-model"
import { ModelRelationDefinition } from "@orm-engine/model/relations/relation-metadata"

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
