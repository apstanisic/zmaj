import { Struct } from "@common/types"
import { camel, mapKeys } from "radash"
import { CamelCasedProperties } from "type-fest"

export function camelCaseKeys<T extends Struct>(val: T): CamelCasedProperties<T> {
	return mapKeys(val, (key, _val) => camel(key)) as CamelCasedProperties<T>
}
