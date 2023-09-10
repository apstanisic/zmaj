import { BaseModel } from "@orm-engine/model/base-model"
import { RelationBuilderResult } from "@orm-engine/model/relations/relation-builder-result"

/**
 * If FK is nullable, we will never be sure that this relation will return, so we need to add undefined
 */
export type AddOptionalNullableFkRelation<
	TKey,
	TModel extends BaseModel,
> = TKey extends keyof TModel
	? TModel[TKey] extends RelationBuilderResult<any, any, infer FKey>
		? FKey extends keyof TModel["fields"]
			? TModel["fields"][FKey]["_nullable"] extends true
				? undefined
				: never
			: never
		: never
	: never
