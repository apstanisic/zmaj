import { OnlyFields } from "@zmaj-js/orm-common"
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
export const ModelSchema = <T>() => {
	return <S extends z.ZodType<OnlyFields<T>, any, any>>(arg: S) => arg
}
