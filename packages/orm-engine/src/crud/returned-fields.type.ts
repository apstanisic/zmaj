import { BaseModel } from "@orm-engine/model/base-model"
import { ModelRelationDefinition } from "@orm-engine/model/relations/relation-metadata"
import { ModelFields } from "@orm-engine/model/types/extract-model-types"
import { Simplify } from "type-fest"
import { IsFieldInRelationNullable } from "./IsFieldInRelationNullable"
import { SubRelation } from "./ReturnedArrayRelationProperties"
import { HandleReturnField } from "./returned-field-properties"
import { SelectFields } from "./select-fields.type"

export type ReturnedFields<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TIncludeHidden extends boolean = false,
> = Simplify<{
	// If field, return field.
	[key in ModelFields<TModel>]: key extends keyof TModel["fields"]
		? HandleReturnField<TModel, TFields, TIncludeHidden, key>
		: key extends keyof TModel
		? TModel[key] extends ModelRelationDefinition<infer TInner, infer TArray>
			? key extends keyof TFields
				? // If relation
				  TFields[key] extends SelectFields<TInner>
					?
							| SubRelation<TInner, TFields[key], TIncludeHidden, TArray>
							| IsFieldInRelationNullable<key, TModel>
					: TFields[key] extends true
					?
							| SubRelation<TInner, undefined, TIncludeHidden, TArray>
							| IsFieldInRelationNullable<key, TModel>
					: never
				: undefined | SubRelation<TInner, undefined, TIncludeHidden, TArray>
			: never
		: never
}>
