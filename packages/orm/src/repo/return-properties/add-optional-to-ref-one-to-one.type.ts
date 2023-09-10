import { RelationType } from "@orm-engine/model/relations/relation-type.types"

/**
 * We can never be sure that some record point to current row, since FK is located in other table
 * For o2m, we can return empty array, here we have to return undefined
 */
export type AddOptionalToRefOneToOne<TRelType extends RelationType> =
	TRelType extends "ref-one-to-one" ? undefined : never
