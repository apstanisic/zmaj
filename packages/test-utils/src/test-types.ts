import { EntityRef } from "@zmaj-js/orm-common"
import {
	TCommentStub,
	TPostInfoStub,
	TPostStub,
	TPostTagStub,
	TTagStub,
} from "./stubs/fake-data.stubs.js"

export type TPost = ReturnType<typeof TPostStub> & {
	comments?: EntityRef<TComment>[]
	tags?: EntityRef<TTag>[]
	postInfo?: EntityRef<TPostInfo> | null
}

export type TComment = ReturnType<typeof TCommentStub> & {
	post?: EntityRef<TPost>
}

export type TTag = ReturnType<typeof TTagStub> & {
	posts?: EntityRef<TPost>[]
}

export type TPostInfo = ReturnType<typeof TPostInfoStub> & {
	post?: EntityRef<TPost>
}

export type TPostTag = ReturnType<typeof TPostTagStub> & {
	post?: EntityRef<TPost>
	tag?: EntityRef<TTag>
}
