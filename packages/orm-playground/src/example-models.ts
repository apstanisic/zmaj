import { BaseModel } from "@zmaj-js/orm"

export class PostModel extends BaseModel {
	name = "posts"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		body: f.text({}),
		createdAt: f.createdAt({}),
		likes: f.int({}),
		title: f.text({}),
	}))

	comments = this.oneToMany(() => CommentModel, { fkField: "postId" })
	tags = this.manyToMany(() => TagModel, {
		junctionModel: () => PostTagModel,
		junctionFields: ["postId", "tagId"],
	})
	info = this.oneToOneRef(() => PostInfoModel, { fkField: "postId" })
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
	}))
	post = this.oneToOneOwner(() => PostModel, { fkField: "postId" })
}
