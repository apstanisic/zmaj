import {
	CommentModel,
	PostInfoModel,
	PostModel,
	TagModel,
	WriterModel,
} from "@orm-engine/example-models"
import { BaseModel } from "@orm-engine/model/base-model"
import { GetReadFields } from "@orm-engine/model/types/extract-model-fields.types"
import { assertType, describe, expectTypeOf, it } from "vitest"
import { ReturnedFieldProperties } from "./returned-field-properties"
import { ReturnedFields } from "./returned-fields.type"

const emptyPost = {
	title: undefined,
	writer: undefined,
	body: undefined,
	comments: undefined,
	createdAt: undefined,
	id: undefined,
	info: undefined,
	likes: undefined,
	tags: undefined,
	writerId: undefined,
}

it("should return fields if no item provided", () => {
	type Expected = {
		id: string
		createdAt: Date
		writerId: string
		likes: number
		body: string
		title: string
		writer?: GetReadFields<WriterModel, false>
		info?: GetReadFields<PostInfoModel, false>
		comments?: GetReadFields<CommentModel, false>[]
		tags?: GetReadFields<TagModel, false>[]
	}

	assertType<Expected>({} as ReturnedFields<PostModel, undefined>)
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
		tags = this.oneToMany(() => Tag, { fkField: "postId" })
		news = this.oneToMany(() => News, { fkField: "postId" })
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

	class News extends BaseModel {
		override name: string = "news"
		fields = this.buildFields((f) => ({
			id: f.uuid({ isPk: true }),
			postId: f.uuid({ nullable: true }),
		}))

		post = this.manyToOne(() => Post, { fkField: "postId" })
	}

	it("should work on m2o", () => {
		const val = {} as ReturnedFields<Tag, { post: true }, false>

		expectTypeOf<{ post: GetReadFields<Post, false> }>(val)
		// @ts-expect-error
		expectTypeOf<{ post: undefined }>(val)
	})

	it("should work on o2o", () => {
		const val = {} as ReturnedFields<Comment, { post: true }, false>

		expectTypeOf<{ post: GetReadFields<Post, false> }>(val)
		// @ts-expect-error
		expectTypeOf<{ post: undefined }>(val)
	})

	it("should return optional when field is nullable ", () => {
		const val = {} as ReturnedFields<News, { post: true }, false>

		expectTypeOf<{ post: GetReadFields<Post, false> | undefined }>(val)
		// @ts-expect-error
		expectTypeOf<{ post: GetReadFields<Post, false> }>(val)
		// @ts-expect-error
		expectTypeOf<{ post: undefined }>(val)
	})

	it("should not impact array side", () => {
		const val = {} as ReturnedFields<Post, { news: true }, false>

		expectTypeOf<{ news: GetReadFields<News, false>[] }>(val)
		// @ts-expect-error
		expectTypeOf<{ news: undefined }>(val)
	})
})

describe("should return selected normal fields", () => {
	class Post extends BaseModel {
		name = "posts"
		fields = this.buildFields((f) => ({
			id: f.uuid({ isPk: true }),
			firstName: f.text({}),
			lastName: f.text({}),
			email: f.text({ nullable: true }),
		}))
	}
	const val = {} as ReturnedFieldProperties<Post, { firstName: true }, false>

	it("should return selected fields", () => {
		expectTypeOf<string>(val.firstName)
	})

	it("should make non selected fields optional", () => {
		expectTypeOf<string | undefined>(val.lastName)
		expectTypeOf<string | null | undefined>(val.email)
		//
		// @ts-expect-error
		expectTypeOf<string>(val.lastName)
		// @ts-expect-error
		expectTypeOf<undefined>(val.lastName)
	})

	it("should keep null if column is nullable ", () => {
		const val = {} as ReturnedFieldProperties<Post, { email: true }, false>

		expectTypeOf<string | null>(val.email)
		// @ts-expect-error
		expectTypeOf<undefined>(val.email)
	})
})

it("should work deep", () => {
	expectTypeOf<ReturnedFields<PostModel, { title: true; writer: { name: true } }, false>>({
		...emptyPost,
		title: "string",
		writer: { name: "hello", id: undefined, posts: undefined },
	})

	expectTypeOf<ReturnedFields<PostModel, { title: true; writer: true }, false>>({
		...emptyPost,
		title: "string",
		writer: { name: "hello", id: "id", posts: undefined },
	})

	expectTypeOf<ReturnedFields<PostModel, { title: true; tags: { posts: { id: true } } }, false>>({
		...emptyPost,
		title: "string",
		tags: [{ id: undefined, name: undefined, posts: [{ ...emptyPost, id: "test" }] }],
	})

	expectTypeOf<ReturnedFields<PostModel, { title: true; comments: true }, false>>({
		...emptyPost,
		title: "string",
		comments: [{ body: "", id: "", post: undefined, postId: "" }],
	})
})

it("should allow to pass $fields to get every readable field", () => {
	expectTypeOf<ReturnedFields<PostModel, { $fields: true }, false>>({
		...emptyPost,
		title: "string",
		body: "string",
		createdAt: new Date(),
		id: "",
		likes: 5,
		writer: undefined,
		comments: undefined,
		info: undefined,
		tags: undefined,
		writerId: "",
	})

	expectTypeOf<ReturnedFields<PostModel, { $fields: true; writer: true }, false>>({
		...emptyPost,
		title: "string",
		body: "string",
		createdAt: new Date(),
		id: "",
		likes: 5,
		writer: { id: "", name: "", posts: undefined },
		comments: undefined,
		info: undefined,
		tags: undefined,
		writerId: "",
	})
})

it("should respect hidden with $fields", () => {
	class Post extends BaseModel {
		name = "posts"
		fields = this.buildFields((f) => ({
			id: f.uuid({ isPk: true }),
			name: f.text({ canRead: false }),
		}))
	}

	expectTypeOf<ReturnedFields<Post, { $fields: true }, false>>({
		id: "",
		name: undefined,
	})
})
