import { CollectionDef, Struct } from "@zmaj-js/common"
import { isString } from "radash"

export type GetEmitKeyParams<T extends Struct = any> = {
	collection: CollectionDef | "*" | string
	action: "read" | "update" | "delete" | "create" | "*"
	type: "before" | "start" | "finish" | "after" | "*"
}

/**
 * Get key that is emitted on crud action
 *
 * Example
 * "zmaj.crud.before.delete.posts"
 * "zmaj.crud.start.update.products"
 * "zmaj.crud.finish.create.students"
 * "zmaj.crud.after.delete.invoices"
 */
export function getCrudEmitKey(params: GetEmitKeyParams): string {
	const { action, collection, type } = params
	return `zmaj.crud.${type}.${action}.${isString(collection) ? collection : collection.tableName}`
}
