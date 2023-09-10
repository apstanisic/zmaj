import { BaseModel } from "@orm-engine/model/base-model"
import { RelationBuilderResult } from "@orm-engine/model/relations/relation-builder-result"
import { ModelPropertyKeys } from "@orm-engine/model/types/ModelPropertyKeys"
import { AddOptionalToRefOneToOne } from "@orm-engine/repo/return-properties/add-optional-to-ref-one-to-one.type"
import { Simplify } from "type-fest"
import { SelectProperties } from "../select-properties/select-properties.type"
import { AddOptionalNullableFkRelation } from "./add-optional-to-nullable-fk-relation"
import { HandleReturnField } from "./returned-field-properties"
import { ReturnedRelationProperties } from "./returned-relation-properties.type"

export type ReturnedProperties<
	TModel extends BaseModel,
	TFields extends SelectProperties<TModel> | undefined,
	TIncludeHidden extends boolean = false,
> = Simplify<{
	// If field, return field.
	[key in ModelPropertyKeys<TModel>]: key extends keyof TModel["fields"]
		? HandleReturnField<
				TModel,
				TFields,
				TIncludeHidden,
				key,
				NonNullable<TFields>["$fields"] extends true ? true : false
		  >
		: key extends keyof TModel
		? TModel[key] extends RelationBuilderResult<infer TInner, infer TRelType, any>
			? key extends keyof TFields
				? // If relation
				  TFields[key] extends SelectProperties<TInner>
					?
							| ReturnedRelationProperties<TInner, TFields[key], TIncludeHidden, TRelType>
							| AddOptionalNullableFkRelation<key, TModel>
							| AddOptionalToRefOneToOne<TRelType>
					: TFields[key] extends true
					?
							| ReturnedRelationProperties<TInner, undefined, TIncludeHidden, TRelType>
							| AddOptionalNullableFkRelation<key, TModel>
							| AddOptionalToRefOneToOne<TRelType>
					: never
				:
						| undefined
						| ReturnedRelationProperties<TInner, undefined, TIncludeHidden, TRelType>
						| AddOptionalNullableFkRelation<key, TModel>
						| AddOptionalToRefOneToOne<TRelType>
			: never
		: never
}>
