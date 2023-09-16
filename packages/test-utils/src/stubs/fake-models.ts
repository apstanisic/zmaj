import { BaseModel } from "@zmaj-js/orm"

export class TPostModel extends BaseModel {
	name = "posts"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		body: f.text({}),
		createdAt: f.createdAt({}),
		likes: f.int({}),
		title: f.text({}),
	}))
}

export class TTagModel extends BaseModel {
	name = "tags"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		name: f.text({}),
	}))
}

export class TCommentModel extends BaseModel {
	name = "comments"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		body: f.text({}),
		postId: f.uuid({ columnName: "post_id" }),
	}))
}

export class TPostTagModel extends BaseModel {
	name = "postsTags"
	override tableName = "posts_tags"
	fields = this.buildFields((f) => ({
		id: f.int({ isPk: true, hasDefault: true }),
		postId: f.uuid({ columnName: "post_id" }),
		tagId: f.uuid({ columnName: "tag_id" }),
	}))
}

export class TPostInfoModel extends BaseModel {
	name = "postsInfo"
	override tableName = "posts_info"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		postId: f.uuid({ columnName: "post_id" }),
		additionalInfo: f.custom<Record<string, any>>()({}),
	}))
}
