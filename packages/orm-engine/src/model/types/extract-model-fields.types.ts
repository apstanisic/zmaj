import { PostInfoModel, PostModel } from "@orm-engine/example-models"
import { assertType, it } from "vitest"
import { BaseModel } from "../base-model"
import { Base } from "../utils/base.type"

export type ExtractFields<T extends BaseModel> = Base<{
	[key in keyof T["fields"]]: T["fields"][key]["_type"]
}>

export type ExtractReadFields<T extends BaseModel> = Base<{
	[key in keyof T["fields"]]: T["fields"][key]["_read"]
}>

export type ExtractReadFieldsOverride<T extends BaseModel> = Base<{
	[key in keyof T["fields"]]: T["fields"][key]["_readOverride"]
}>
export type ExtractCreateFields<T extends BaseModel> = Base<{
	[key in keyof T["fields"]]: T["fields"][key]["_create"]
}>
export type ExtractCreateFieldsOverride<T extends BaseModel> = Base<{
	[key in keyof T["fields"]]: T["fields"][key]["_createOverride"]
}>
export type ExtractUpdateFields<T extends BaseModel> = Base<{
	[key in keyof T["fields"]]: T["fields"][key]["_update"]
}>
export type ExtractUpdateFieldsOverride<T extends BaseModel> = Base<{
	[key in keyof T["fields"]]: T["fields"][key]["_updateOverride"]
}>

export type GetReadFields<TModel extends BaseModel, TAddHidden extends boolean> = Base<{
	[key in keyof TModel["fields"]]: TAddHidden extends true
		? TModel["fields"][key]["_readOverride"]
		: TModel["fields"][key]["_read"]
}>
/**
 *
 * TESTS
 *
 */
if (import.meta.vitest) {
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
		const val = {} as ExtractReadFields<PostModel>
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
		const val = {} as ExtractUpdateFields<PostModel>
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
		const val = {} as ExtractCreateFields<PostModel>
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
		const val = {} as ExtractReadFields<PostInfoModel>
		// @ts-expect-error
		assertType<string>(val.hiddenField)
		assertType<string | undefined>(val.hiddenField)
	})
}
