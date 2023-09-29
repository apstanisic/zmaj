import { BaseModel } from "@zmaj-js/orm"

export class TPostModel extends BaseModel {
	name = "posts"
	fields = this.buildFields((f) => ({
		id: f.uuidPk({}),
		body: f.text({}),
		createdAt: f.createdAt({}),
		likes: f.int({}),
		title: f.text({}),
	}))

	tags = this.manyToMany(() => TTagModel, {
		junctionModel: () => TPostTagModel,
		junctionFields: ["postId", "tagId"],
	})

	comments = this.oneToMany(() => TCommentModel, { fkField: "postId" })

	info = this.oneToOneRef(() => TPostInfoModel, { fkField: "postId" })
}

export class TTagModel extends BaseModel {
	name = "tags"
	fields = this.buildFields((f) => ({
		id: f.uuidPk({}),
		name: f.text({}),
	}))

	posts = this.manyToMany(() => TPostModel, {
		junctionModel: () => TPostTagModel,
		junctionFields: ["tagId", "postId"],
	})
}

export class TCommentModel extends BaseModel {
	name = "comments"
	fields = this.buildFields((f) => ({
		id: f.uuidPk({}),
		body: f.text({}),
		postId: f.uuid({ columnName: "post_id" }),
	}))

	post = this.manyToOne(() => TPostModel, { fkField: "postId" })
}

export class TPostTagModel extends BaseModel {
	name = "postsTags"
	override tableName = "posts_tags"
	fields = this.buildFields((f) => ({
		id: f.intPk({}),
		postId: f.uuid({ columnName: "post_id" }),
		tagId: f.uuid({ columnName: "tag_id" }),
	}))

	post = this.manyToOne(() => TPostModel, { fkField: "postId" })
	tag = this.manyToOne(() => TTagModel, { fkField: "tagId" })
}

export class TPostInfoModel extends BaseModel {
	name = "postsInfo"
	override tableName = "posts_info"
	fields = this.buildFields((f) => ({
		id: f.uuidPk({}),
		postId: f.uuid({ columnName: "post_id", isUnique: true }),
		additionalInfo: f.custom<Record<string, any>>()({}),
	}))

	post = this.oneToOneOwner(() => TPostModel, { fkField: "postId" })
}
