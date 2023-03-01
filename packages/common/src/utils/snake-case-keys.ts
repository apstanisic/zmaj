import { Struct } from "@common/types"
import { mapKeys } from "radash"
import { SnakeCasedProperties } from "type-fest"
import { snakeCase } from "./lodash"

export function snakeCaseKeys<T extends Struct>(obj: T): SnakeCasedProperties<T> {
	return mapKeys(obj, (key, _val) => snakeCase(key)) as SnakeCasedProperties<T>
}
