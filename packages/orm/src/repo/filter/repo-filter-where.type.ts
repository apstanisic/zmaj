import { BaseModel } from "@orm/model/base-model"
import { RelationBuilderResult } from "@orm/model/relations/relation-builder-result"
import { GetModelFields } from "@orm/model/types/get-model-fields.types"
import { ModelPropertyKeys } from "@orm/model/types/model-property-keys"
import { RequireExactlyOne, Simplify } from "type-fest"

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
}>

export type RepoFilterWhere<TModel extends BaseModel> = Simplify<
	| {
			[key in ModelPropertyKeys<TModel>]?: key extends keyof GetModelFields<TModel>
				? GetModelFields<TModel>[key] | Comparisons<GetModelFields<TModel>[key]>
				: key extends keyof TModel
				? TModel[key] extends RelationBuilderResult<infer TInner, any, any>
					? RepoFilterWhere<TInner>
					: never
				: never
	  }
	| RequireExactlyOne<{
			$and: [RepoFilterWhere<TModel>, RepoFilterWhere<TModel>, ...RepoFilterWhere<TModel>[]]
			$or: [RepoFilterWhere<TModel>, RepoFilterWhere<TModel>, ...RepoFilterWhere<TModel>[]] //
	  }>
>
