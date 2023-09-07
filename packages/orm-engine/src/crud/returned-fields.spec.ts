import {
	CommentModel,
	PostInfoModel,
	PostModel,
	TagModel,
	WriterModel,
} from "@orm-engine/example-models"
import { BaseModel } from "@orm-engine/model/base-model"
import { ModelType } from "@orm-engine/model/types/extract-model-types"
import { assertType, describe, expectTypeOf, it } from "vitest"
import { ReturnedFields } from "./returned-fields.type"

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

describe("should return object left contain fk and know fk is not null", () => {
	class Post extends BaseModel {
		override name: string = "posts"
		fields = this.buildFields((f) => ({
			id: f.uuid({ isPk: true }),
		}))
		comment = this.oneToOneRef(() => Comment, { fkField: "postId" })
	}
	class Comment extends BaseModel {
		override name: string = "comments"
		fields = this.buildFields((f) => ({
			id: f.uuid({ isPk: true }),
			postId: f.uuid({}),
		}))

		post = this.oneToOneOwner(() => Post, { fkField: "postId" })
	}

	class Tag extends BaseModel {
		override name: string = "tags"
		fields = this.buildFields((f) => ({
			id: f.uuid({ isPk: true }),
			postId: f.uuid({}),
		}))

		post = this.oneToOneOwner(() => Post, { fkField: "postId" })
	}

	it("should work on m2o", () => {
		const val = {} as ReturnedFields<Tag, { post: true }, false>

		expectTypeOf<{ post: ModelType<Post> }>(val)
		// @ts-expect-error
		expectTypeOf<{ post: undefined }>(val)
	})

	it("should work on o2o", () => {
		const val = {} as ReturnedFields<Comment, { post: true }, false>
		// ITS UNDEFINED BECAUSE RELATION IS BY DEFAULT?
		// I CAN'T SIMPLY RETURN TYPE IF TYPE IS RELATION

		expectTypeOf<{ post: ModelType<Post> }>(val)
		// @ts-expect-error
		expectTypeOf<{ post: undefined }>(val)
	})
})
