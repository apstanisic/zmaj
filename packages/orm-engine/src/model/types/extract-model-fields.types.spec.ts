import { PostInfoModel, PostModel } from "@orm-engine/example-models"
import { assertType, it } from "vitest"
import {
	ExtractFields,
	GetCreateFields,
	GetReadFields,
	GetUpdateFields,
} from "./extract-model-fields.types"

it("should extract types", () => {
	const val = {} as ExtractFields<PostModel>
	assertType<{
		id: string
		body: string
		createdAt: Date
		likes: number
		title: string
		writerId: string
	}>(val)
})

it("should extract read types", () => {
	const val = {} as GetReadFields<PostModel, false>
	assertType<{
		id: string
		body: string
		createdAt: Date
		likes: number
		title: string
		writerId: string
	}>(val)
})

it("should extract update field types", () => {
	const val = {} as GetUpdateFields<PostModel, false>
	assertType<{
		id?: string | undefined
		body?: string | undefined
		createdAt?: Date | undefined
		likes?: number | undefined
		title?: string | undefined
		writerId?: string | undefined
	}>(val)
})

it("should extract create field types", () => {
	const val = {} as GetCreateFields<PostModel, false>
	assertType<{
		id?: string | null
		body: string
		createdAt?: undefined
		likes: number
		title: string
		writerId: string
	}>(val)
})

it("should respect canRead", () => {
	const val = {} as GetReadFields<PostInfoModel, false>
	// @ts-expect-error
	assertType<string>(val.hiddenField)
	assertType<string | undefined>(val.hiddenField)
})
