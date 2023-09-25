import { IdType, Transaction } from "@zmaj-js/orm"
import { ZodSchema } from "zod"

export type CrudMethodOptions<T> = {
	/**
	 * Transaction to be used. Service will start new if not provided
	 */
	em?: Transaction
	/** */
	dto?: Partial<T>
	/** */
	ids?: IdType[]

	/**
	 * Function or schema that should be used for creating item.
	 * Example: newUser is function that sets some defaults when creating user and sets password
	 */

	factory?: ZodSchema<T> | ((params: unknown) => T | Promise<T>)
}
