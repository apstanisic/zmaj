import {
	CommentModel,
	PostInfoModel,
	PostModel,
	TagModel,
	WriterModel,
} from "@orm-engine/example-models"
import { BaseModel } from "@orm-engine/model/base-model"
import { ModelType } from "@orm-engine/model/types/extract-model-types"
import { Base } from "@orm-engine/model/utils/base.type"
import { EmptyObject, UnwrapOpaque } from "type-fest"
import { tag } from "type-fest/source/opaque"
import { assertType, it } from "vitest"
import { ModelVariant } from "./model-variant.type"
import { SelectFields } from "./select-fields.type"

// Check if type is array. Strips null and undefined
type IsArray<T> = NonNullable<T> extends any[] ? true : false

// Make type array is `Is` is `true`
type MakeArrayIf<Is extends boolean, T> = Is extends true ? T[] : T

type ShowHidden<T extends boolean> = T extends true ? "default" : "read"

export type ReturnedFields<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TIncludeHidden extends boolean = false,
> = Omit<
	Base<
		TFields extends undefined | EmptyObject
			? UnwrapOpaque<ModelType<TModel, ShowHidden<TIncludeHidden>>>
			: UnwrapOpaque<{
					[key in keyof Required<ModelType<TModel>>]: NonNullable<TFields>[key] extends true // if true, simply return required type
						? ModelType<TModel, ShowHidden<TIncludeHidden>>[key]
						: NonNullable<TFields>[key] extends object // if select object, pick fields
						? // keep type array if it's array relation
						  NonNullable<ModelType<TModel>[key]> extends ModelVariant<infer R extends BaseModel>
							? MakeArrayIf<
									IsArray<NonNullable<ModelType<TModel, ShowHidden<TIncludeHidden>>[key]>>,
									ReturnedFields<R, NonNullable<TFields>[key]>
							  >
							: NonNullable<ModelType<TModel, ShowHidden<TIncludeHidden>>[key]>
						: ModelType<TModel, ShowHidden<TIncludeHidden>>[key] | undefined // otherwise return current type but make in optional
			  }>
	>,
	typeof tag // temp workaround for Opaque until i figure out why it's not working
>

if (import.meta.vitest) {
	//
	it("should return fields if no item provided", () => {
		type Expected = {
			id: string
			createdAt: Date
			writerId: string
			likes: number
			body: string
			title: string
			writer?: ModelType<WriterModel>
			info?: ModelType<PostInfoModel>
			comments?: ModelType<CommentModel>[]
			tags?: ModelType<TagModel>[]
		}

		assertType<Expected>({} as ReturnedFields<PostModel, undefined>)
		// eslint-disable-next-line @typescript-eslint/ban-types
		assertType<Expected>({} as ReturnedFields<PostModel, {}>)
	})

	it("should return simple fields", () => {
		assertType<{ body: string; title: string }>(
			{} as ReturnedFields<PostModel, { body: true; title: true }>,
		)
		assertType<{ id: string; createdAt: Date }>(
			{} as ReturnedFields<PostModel, { id: true; createdAt: true }>,
		)
	})

	it("should unwrap when undefined", () => {
		const val = {} as ReturnedFields<PostInfoModel, undefined>
	})

	it("should allow to return hidden", () => {
		const val = {} as ReturnedFields<PostInfoModel, { hiddenField: true; id: true }>
		// @ts-expect-error
		assertType<string>(val.hiddenField)
		assertType<string>(val.id)
	})

	it("should return m2o relations", () => {
		const val = {} as ReturnedFields<PostModel, { body: true; writer: { name: true } }>
		assertType<{ body: string; writer: { name: string; id?: string } }>(val)
	})

	it("should return o2m relations", () => {
		const val = {} as ReturnedFields<PostModel, { body: true; comments: { body: true } }>
		assertType<{ body: string; comments: { body: string }[] }>(val)
	})

	it("should return m2m relations", () => {
		const val = {} as ReturnedFields<PostModel, { body: true; tags: { name: true } }>
		assertType<{ body: string; tags: { name: string }[] }>(val)
	})
}
