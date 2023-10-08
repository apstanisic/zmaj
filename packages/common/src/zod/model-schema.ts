import { BaseModel, GetCreateFields, GetModelFields } from "@zmaj-js/orm"
import { z } from "zod"

/**
 * This is just a helper function that ensures that returned value
 * from zod schema is valid db model. Because of the limitations of TS
 * we can't fully infer all aspects without using inner function
 * This does not include relations, and partial objects, but that's okay, since
 * model data is always either value or null (db does not return undefined)
 * @example
 * ```js
 * const TestSchema = ModelSchema<{id: string}>()(z.object({id: z.string()}))
 * ```
 */
export const ModelSchema = <T extends BaseModel>() => {
	return <S extends z.ZodType<GetModelFields<T>, any, any>>(arg: S) => arg
}

export const SchemaCheck = <T>() => {
	return <S extends z.ZodType<T, any, any>>(arg: S) => arg
}

export const CreateModelSchema = <
	TModel extends BaseModel,
	TOverrideCanCreate extends boolean = false,
>() => {
	return <S extends z.ZodType<GetCreateFields<TModel, TOverrideCanCreate>, any, any>>(arg: S) =>
		arg
}
