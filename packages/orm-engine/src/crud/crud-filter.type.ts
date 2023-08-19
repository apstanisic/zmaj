import { PostModel } from "@orm-engine/example-models"
import { BaseModel } from "@orm-engine/model/base-model"
import { ModelType } from "@orm-engine/model/types/extract-model-types"
import { RequireExactlyOne, Simplify } from "type-fest"
import { assertType, it } from "vitest"
import { ModelVariant } from "./model-variant.type"

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

export type CrudFilter<T extends BaseModel> = Simplify<
	| {
			[key in keyof ModelType<T>]?: NonNullable<
				NonNullable<ModelType<T>>[key]
			> extends ModelVariant<infer R extends BaseModel>
				? CrudFilter<R>
				: NonNullable<ModelType<T>>[key] | Comparisons<NonNullable<ModelType<T>>[key]> | null
	  }
	| RequireExactlyOne<{ $and: CrudFilter<T>[]; $or: CrudFilter<T>[] }>
>

if (import.meta.vitest) {
	//
	it("should work with simple filter", () => {
		assertType<CrudFilter<PostModel>>({
			body: "hello",
			createdAt: { $lt: new Date() },
			title: { $nin: ["Hello", "World"] },
		})
	})
	it("should allow nesting", () => {
		assertType<CrudFilter<PostModel>>({
			comments: {
				body: "Hello World",
			},
			info: {
				post: {
					body: { $like: "World" }, //
				},
			},
		})
	})

	it("should allow $and and $or", () => {
		assertType<CrudFilter<PostModel>>({
			comments: {
				$or: [{ body: "Hello" }, { id: { $ne: "test" } }],
			},
			info: {
				post: { $and: [{ likes: { $gte: 5 } }] },
			},
		})
	})
}
