import { CommentModel, PostInfoModel, PostModel, TagModel, WriterModel } from "@orm/example-models"
import { BaseModel } from "@orm/model/base-model"
import { GetReadFields } from "@orm/model/types/get-model-fields.types"
import { assertType, describe, expectTypeOf, it } from "vitest"
import { ReturnedFieldProperties } from "./returned-field-properties"
import { ReturnedProperties } from "./returned-properties.type"

const NEVER: never = undefined as never

const emptyPost = {
	title: NEVER,
	writer: NEVER,
	body: NEVER,
	comments: NEVER,
	createdAt: NEVER,
	id: NEVER,
	info: NEVER,
	likes: NEVER,
	tags: NEVER,
	writerId: NEVER,
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

	assertType<Expected>({} as ReturnedProperties<PostModel, undefined>)
})

it("should return simple fields", () => {
	assertType<{ body: string; title: string }>(
		{} as ReturnedProperties<PostModel, { body: true; title: true }>,
	)
	assertType<{ id: string; createdAt: Date }>(
		{} as ReturnedProperties<PostModel, { id: true; createdAt: true }>,
	)
})

it("should unwrap when undefined", () => {
	const val = {} as ReturnedProperties<PostInfoModel, undefined>
})

it("should allow to return hidden", () => {
	const val = {} as ReturnedProperties<PostInfoModel, { hiddenField: true; id: true }>
	// @ts-expect-error
	assertType<string>(val.hiddenField)
	assertType<string>(val.id)
})

it("should return m2o relations", () => {
	const val = {} as ReturnedProperties<PostModel, { body: true; writer: { name: true } }>
	assertType<{ body: string; writer: { name: string; id?: string } }>(val)
})

it("should return o2m relations", () => {
	const val = {} as ReturnedProperties<PostModel, { body: true; comments: { body: true } }>
	assertType<{ body: string; comments: { body: string }[] }>(val)
})

it("should return m2m relations", () => {
	const val = {} as ReturnedProperties<PostModel, { body: true; tags: { name: true } }>
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
		const val = {} as ReturnedProperties<Tag, { post: true }, false>

		expectTypeOf<{ post: GetReadFields<Post, false> }>(val)
		// @ts-expect-error
		expectTypeOf<{ post: undefined }>(val)
	})

	it("should work on o2o", () => {
		const val = {} as ReturnedProperties<Comment, { post: true }, false>

		expectTypeOf<{ post: GetReadFields<Post, false> }>(val)
		// @ts-expect-error
		expectTypeOf<{ post: undefined }>(val)
	})

	it("should return null when field is nullable ", () => {
		const val = {} as ReturnedProperties<News, { post: true }, false>

		expectTypeOf<{ post: GetReadFields<Post, false> | null }>(val)
		// @ts-expect-error
		expectTypeOf<{ post: GetReadFields<Post, false> }>(val)
		// @ts-expect-error
		expectTypeOf<{ post: undefined }>(val)
	})

	it("should not impact array side", () => {
		const val = {} as ReturnedProperties<Post, { news: true }, false>

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
	expectTypeOf<ReturnedProperties<PostModel, { title: true; writer: { name: true } }, false>>({
		...emptyPost,
		title: "string",
		writer: { name: "hello", id: NEVER, posts: NEVER },
	})

	expectTypeOf<ReturnedProperties<PostModel, { title: true; writer: true }, false>>({
		...emptyPost,
		title: "string",
		writer: { name: "hello", id: "id", posts: NEVER },
	})

	expectTypeOf<
		ReturnedProperties<PostModel, { title: true; tags: { posts: { id: true } } }, false>
	>({
		...emptyPost,
		title: "string",
		tags: [{ id: NEVER, name: NEVER, posts: [{ ...emptyPost, id: "test" }] }],
	})

	expectTypeOf<ReturnedProperties<PostModel, { title: true; comments: true }, false>>({
		...emptyPost,
		title: "string",
		comments: [{ body: "", id: "", post: NEVER, postId: "" }],
	})
})

it("should allow to pass $fields to get every readable field", () => {
	expectTypeOf<ReturnedProperties<PostModel, { $fields: true }, false>>({
		...emptyPost,
		title: "string",
		body: "string",
		createdAt: new Date(),
		id: "",
		likes: 5,
		writer: NEVER,
		comments: NEVER,
		info: NEVER,
		tags: NEVER,
		writerId: "",
	})

	expectTypeOf<ReturnedProperties<PostModel, { $fields: true; writer: true }, false>>({
		...emptyPost,
		title: "string",
		body: "string",
		createdAt: new Date(),
		id: "",
		likes: 5,
		writer: { id: "", name: "", posts: {} as never },
		comments: {} as never,
		info: {} as never,
		tags: {} as never,
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

	expectTypeOf<ReturnedProperties<Post, { $fields: true }, false>>({
		id: "",
		name: undefined,
	})
})

it("should always return nullable for ref o2o", () => {
	// If fk is not located in it's table, we cannot guarantee that it exists.
	// For example Writer is created, and they can have 1 post. But that post might not yet exist
	class Post extends BaseModel {
		override name = "post"
		fields = this.buildFields((f) => ({
			id: f.uuid({ isPk: true }),
			title: f.text({}),
			writerId: this.field.uuid({}),
		}))
		writer = this.oneToOneOwner(() => Writer, { fkField: "writerId" })
	}

	class Writer extends BaseModel {
		override name = "writer"
		fields = this.buildFields((f) => ({
			id: this.field.uuid({ isPk: true }),
		}))

		post = this.oneToOneRef(() => Post, { fkField: "writerId" })
	}

	type Result = ReturnedProperties<Writer, { post: true }, true>

	expectTypeOf<Result["post"]>(null)
	expectTypeOf<Result["post"]>({ id: "", title: "", writer: NEVER, writerId: "" })
})
