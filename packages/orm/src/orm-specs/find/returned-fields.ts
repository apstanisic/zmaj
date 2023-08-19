import { BaseModel, Fields, ModelType, ModelVariant } from "@zmaj-js/orm-common"
import { Simplify, UnwrapOpaque } from "type-fest"
import { PostModel } from "../models.stub"

// Check if type is array. Strips null and undefined
type IsArray<T> = NonNullable<T> extends any[] ? true : false

// Make type array is `Is` is `true`
type MakeArrayIf<Is extends boolean, T> = Is extends true ? T[] : T

export type ReturnedFields2<
	TModel extends BaseModel,
	TFields extends Fields<ModelType<TModel>> | undefined,
	TIncludeHidden extends boolean = false,
> = Simplify<
	TFields extends undefined
		? UnwrapOpaque<ModelType<TModel>>
		: UnwrapOpaque<{
				[key in keyof Required<ModelType<TModel>>]: NonNullable<TFields>[key] extends true // if true, simply return required type
					? // ? NonNullable<ModelType<TModel>[key]>
					  NonNullable<ModelType<TModel>[key]> extends ModelVariant<infer R>
						? ReturnedFields2<R, TFields[key]>
						: NonNullable<ModelType<TModel>[key]>
					: ModelType<TModel>[key] | undefined
		  }>
>

type A = ReturnedFields2<PostModel, { id: true; createdAt: true; writer: true }>
const b: A = { id: "5", createdAt: new Date(), writer: {} }
// const b: A = { body: "", createdAt: new Date(), id: "53", likes: 55, title: "fsda" }

export type ReturnedFields<
	TModel extends BaseModel,
	TFields extends Fields<ModelType<TModel>> | undefined,
	TIncludeHidden extends boolean = false,
> = TFields extends undefined
	? ModelType<TModel>
	: {
			[key in keyof Required<ModelType<TModel>>]: NonNullable<TFields>[key] extends true // if true, simply return required type
				? NonNullable<ModelType<TModel>[key]>
				: NonNullable<TFields>[key] extends object // if object, pick fields
				? // keep type array if it's array relation
				  NonNullable<ModelType<TModel>[key]> extends ModelType<infer R>
					? ReturnedFields<R, TFields[key]>
					: NonNullable<ModelType<TModel>[key]>
				: // TModel['fields'][key]
				  //   MakeArrayIf<
				  // 		IsArray<ModelType<TModel>[key]>, //
				  // 		// Simplify<StripModelType<T[key]>>
				  // 		ReturnedFields<TModel[key], NonNullable<F>[key]>
				  //   >
				  ModelType<TModel>[key] | undefined // otherwise return current type but make in optional
	  }

// 	  export type ReturnedFields<
// 	  T,
// 	  F extends Fields<T> | undefined,
// 	  TIncludeHidden extends boolean = false,
//   > = F extends undefined
// 	  ? T
// 	  : {
// 			  [key in keyof Required<T>]: NonNullable<F>[key] extends true // if true, simply return required type
// 				  ? NonNullable<T[key]>
// 				  : NonNullable<F>[key] extends object // if object, pick fields
// 				  ? // keep type array if it's array relation
// 					MakeArrayIf<
// 						  IsArray<T[key]>, //
// 						  // Simplify<StripModelType<T[key]>>
// 						  ReturnedFields<StripModelType<T[key]>, NonNullable<F>[key]>
// 					>
// 				  : T[key] | undefined // otherwise return current type but make in optional
// 		}

// I do not like bellow example because it breaks the flow,
// It create type:
// { ...fields } & {...relations }, and there is problem when I want to use key to map
//
// export type ReturnedFields2<T, F extends Fields<T> | undefined> = F extends undefined
// 	? T
// 	: {
// 			[key in keyof OnlyFields<T>]: NonNullable<F>[key] extends true ? T[key] : undefined | T[key]
// 	  } & {
// 			[key in keyof OnlyRelations<T>]: NonNullable<F>[key] extends true
// 				? StripEntityRefKeepArray<T[key]>
// 				: NonNullable<F>[key] extends object
// 				? MakeArrayIf<
// 						IsArray<T[key]>, //
// 						ReturnedFields<StripEntityRef<T[key]>, NonNullable<F>[key]>
// 				  >
// 				: undefined | T[key]
// 	  }
