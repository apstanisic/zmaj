import {
	randColor,
	randJSON,
	randNumber,
	randParagraph,
	randPastDate,
	randPhrase,
} from "@ngneat/falso"
import { Stub } from "@zmaj-js/common"
import { v4 } from "uuid"
import { z } from "zod"

export const TPostStub = Stub(
	z.object({
		id: z.string().uuid().default(v4),
		body: z.string().default(randParagraph),
		createdAt: z.date().default(randPastDate),
		likes: z.number().int().default(randNumber),
		title: z.string().default(randPhrase),
	}),
	() => ({}),
)

export const TCommentStub = Stub(
	z.object({
		id: z.string().uuid().default(v4),
		body: z.string().default(randParagraph),
		postId: z.string().uuid().default(v4),
	}),
	() => ({}),
)

export const TPostInfoStub = Stub(
	z.object({
		id: z.string().uuid().default(v4),
		postId: z.string().uuid().default(v4),
		additionalInfo: z.record(z.unknown()).default(() => randJSON({ maxKeys: 3 })),
	}),
	() => ({}),
)

export const TTagStub = Stub(
	z.object({
		id: z.string().uuid().default(v4),
		name: z.string().default(randColor),
	}),

	() => ({}),
)

export const TPostTagStub = Stub(
	z.object({
		id: z.number().nullish(),
		postId: z.string().uuid().default(v4),
		tagId: z.string().uuid().default(v4),
	}),
	() => ({}),
)
