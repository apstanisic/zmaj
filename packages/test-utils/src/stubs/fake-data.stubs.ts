import {
	randColor,
	randJSON,
	randNumber,
	randParagraph,
	randPastDate,
	randPhrase,
} from "@ngneat/falso"
import { Struct, stub } from "@zmaj-js/common"
import { v4 } from "uuid"

export const TPostStub = stub(() => ({
	id: v4(),
	body: randParagraph(),
	createdAt: randPastDate(),
	likes: randNumber(),
	title: randPhrase(),
}))

export const TCommentStub = stub(() => ({ id: v4(), body: randParagraph(), postId: v4() }))

export const TPostInfoStub = stub(() => ({
	id: v4(),
	postId: v4(),
	additionalInfo: randJSON({ maxKeys: 3 }) as Struct,
}))

export const TTagStub = stub(() => ({ id: v4(), name: randColor() }))

export const TPostTagStub = stub(() => ({ id: null as null | number, postId: v4(), tagId: v4() }))
