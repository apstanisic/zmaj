import { BaseModel } from "@orm-engine/model/base-model"

import { ReturnedFields } from "./returned-fields.type"
import { SelectFields } from "./select-fields.type"

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
