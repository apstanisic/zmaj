import { RequireExactlyOne, Simplify } from "type-fest"
import { BaseModel, ModelType, ModelVariant } from ".."

type Comparisons<T> = RequireExactlyOne<{
	$eq: T
	$ne: T // not equal
	$lt: T // less than
	$lte: T // less than or equal
	$gt: T // greater than
	$gte: T // greater than or equal
	$in: T[] // is in
	$nin: T[] // not in
	// non mongo but has support in sql
	// like is only possible for string
	$like: string
	// $like: T
}>

export type Filter<T extends ModelType<BaseModel>> = Simplify<
	| {
			[key in keyof T]?: NonNullable<T[key]> extends ModelVariant<infer R>
				? Filter<ModelType<R>>
				: T[key] | Comparisons<T[key]> | null
	  }
	| RequireExactlyOne<{ $and: Filter<T>[]; $or: Filter<T>[] }>
>

// export type Filter<T = Record<string, any>> =
// 	//
// 	| {
// 			// DIRTY FIX FOR DATE
// 			[key in keyof T]?: NonNullable<T[key]> extends Date
// 				? T[key] | Comparisons<T[key]> | null
// 				: NonNullable<T[key]> extends EntityRefVariants<infer R>
// 				? Filter<StripEntityRef<R>>
// 				: T[key] | Comparisons<T[key]> | null
// 	  }
// 	| RequireExactlyOne<{ $and: Filter<T>[]; $or: Filter<T>[] }>

// | ({
// 		[key in keyof OnlyFields<T>]?: T[key] | Comparisons<T[key]>
//   } & {
// 		[key in keyof OnlyRelations<T>]?: Filter<StripEntityRef<T[key]>>
//   })
// | RequireExactlyOne<{ $and: Filter<T>[]; $or: Filter<T>[] }>
