import { BaseModel } from "@orm-engine/model/base-model"
import {
	ArrayRelationModels,
	DirectRelationModels,
} from "@orm-engine/model/types/extract-model-relations.type"
import { ReturnedFields } from "./returned-fields.type"
import { SelectFields } from "./select-fields.type"

export type HandleReturnArrayRelation<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TAddHidden extends boolean,
	TKey,
> = TKey extends keyof ArrayRelationModels<TModel>
	? TKey extends keyof NonNullable<TFields>
		? NonNullable<TFields>[TKey] extends true
			? ReturnedFields<ArrayRelationModels<TModel>[TKey], undefined, TAddHidden>
			: NonNullable<TFields>[TKey] extends object
			? ReturnedFields<ArrayRelationModels<TModel>[TKey], NonNullable<TFields>[TKey], TAddHidden>
			: never
		: NonNullable<TFields> | TKey | ArrayRelationModels<TModel>[TKey]
	: // ReturnedFields<ArrayRelationModels<TModel>[TKey], undefined, TAddHidden> | undefined
	  never

export type HandleReturnDirectRelation<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TAddHidden extends boolean,
	TKey,
> = TKey extends keyof DirectRelationModels<TModel>
	? TKey extends keyof NonNullable<TFields>
		? NonNullable<TFields>[TKey] extends true
			? ReturnedFields<DirectRelationModels<TModel>[TKey], undefined, TAddHidden>
			: NonNullable<TFields>[TKey] extends object
			? ReturnedFields<DirectRelationModels<TModel>[TKey], NonNullable<TFields>[TKey], TAddHidden>
			: never
		: ReturnedFields<DirectRelationModels<TModel>[TKey], undefined, TAddHidden> | undefined
	: never

export type SubRelation<
	TInnerModel extends BaseModel,
	TInnerFields extends SelectFields<TInnerModel> | undefined,
	TAddHidden extends boolean,
	TIsArray extends boolean,
> = TIsArray extends true
	? SubRelationInner<TInnerModel, TInnerFields, TAddHidden>[] //
	: SubRelationInner<TInnerModel, TInnerFields, TAddHidden> //

export type SubRelationInner<
	TInnerModel extends BaseModel,
	TInnerFields extends SelectFields<TInnerModel> | undefined,
	TAddHidden extends boolean,
> = TInnerFields extends undefined
	? ReturnedFields<TInnerModel, undefined, TAddHidden>
	: TInnerFields extends object
	? ReturnedFields<TInnerModel, TInnerFields, TAddHidden>
	: never

// TKey extends keyof DirectRelationModels<TInnerModel>
// 	? TKey extends keyof NonNullable<TInnerFields>
// 		? NonNullable<TInnerFields>[TKey] extends true
// 			? CCC<DirectRelationModels<TInnerModel>[TKey], undefined, TAddHidden>
// 			: NonNullable<TInnerFields>[TKey] extends object
// 			? CCC<DirectRelationModels<TInnerModel>[TKey], NonNullable<TInnerFields>[TKey], TAddHidden>
// 			: never
// 		: CCC<DirectRelationModels<TInnerModel>[TKey], undefined, TAddHidden> | undefined
// 	: never
