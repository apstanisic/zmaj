import {
	TCommentStub,
	TPostInfoStub,
	TPostStub,
	TPostTagStub,
	TTagStub,
} from "./stubs/fake-data.stubs.js"

export type TPost = ReturnType<typeof TPostStub> & {
	comments?: TComment[]
	tags?: TTag[]
	postInfo?: TPostInfo | null
}

export type TComment = ReturnType<typeof TCommentStub> & {
	post?: TPost
}

export type TTag = ReturnType<typeof TTagStub> & {
	posts?: TPost[]
}

export type TPostInfo = ReturnType<typeof TPostInfoStub> & {
	post?: TPost
}

export type TPostTag = ReturnType<typeof TPostTagStub> & {
	post?: TPost
	tag?: TTag
}
