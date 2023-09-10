import { BaseModel } from "@orm-engine/model/base-model"
import { ModelType } from "@orm-engine/model/types/extract-model-types"
import { RequireExactlyOne, Simplify } from "type-fest"
import { ModelVariant } from "../../crud/model-variant.type"

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

export type RepoFilterWhere<T extends BaseModel> = Simplify<
	| {
			[key in keyof ModelType<T>]?: NonNullable<
				NonNullable<ModelType<T>>[key]
			> extends ModelVariant<infer R extends BaseModel>
				? RepoFilterWhere<R>
				: NonNullable<ModelType<T>>[key] | Comparisons<NonNullable<ModelType<T>>[key]> | null
	  }
	| RequireExactlyOne<{ $and: RepoFilterWhere<T>[]; $or: RepoFilterWhere<T>[] }>
>
