import { BaseModel } from "./model/base-model"

export class WriterModel extends BaseModel {
	name = "writers"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		name: f.text({}),
	}))

	posts = this.oneToMany(() => PostModel, { fkField: "writerId" })
}

export class PostModel extends BaseModel {
	name = "posts"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		body: f.text({}),
		createdAt: f.createdAt({}),
		likes: f.int({}),
		title: f.text({}),
		writerId: f.uuid({}),
	}))

	comments = this.oneToMany(() => CommentModel, { fkField: "postId" })
	tags = this.manyToMany(() => TagModel, {
		junctionModel: () => PostTagModel,
		junctionFields: ["postId", "tagId"],
	})
	info = this.oneToOneRef(() => PostInfoModel, { fkField: "postId" })
	writer = this.manyToOne(() => WriterModel, { fkField: "writerId" })
}

export class TagModel extends BaseModel {
	name = "tags"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		name: f.text({}),
	}))

	posts = this.manyToMany(() => PostModel, {
		junctionModel: () => PostTagModel,
		junctionFields: ["tagId", "postId"],
	})
}

export class CommentModel extends BaseModel {
	name = "comments"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		body: f.text({}),
		postId: f.uuid({ columnName: "post_id" }),
	}))

	post = this.manyToOne(() => PostModel, { fkField: "postId" })
}

export class PostTagModel extends BaseModel {
	name = "posts_tags"
	fields = this.buildFields((f) => ({
		id: f.int({ isPk: true, hasDefault: true }),
		postId: f.uuid({ columnName: "post_id" }),
		tagId: f.uuid({ columnName: "tag_id" }),
	}))

	post = this.manyToOne(() => PostModel, { fkField: "postId" })
	tag = this.manyToOne(() => TagModel, { fkField: "tagId" })
}

export class PostInfoModel extends BaseModel {
	name = "posts_info"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		postId: f.uuid({ columnName: "post_id" }),
		additionalInfo: f.custom<Record<string, any>>()({}),
		hiddenField: f.text({ canRead: false }),
	}))
	post = this.oneToOneOwner(() => PostModel, { fkField: "postId" })
}
