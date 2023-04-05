import { RelationMetadata } from "@common/modules"
import { SetRequired } from "type-fest"

/**
 * Base relation with shared types between direct and junction version.
 *
 * Even though junction is `undefined` in direct version, specify it here so that it shows in TS
 */
type BaseRelation = {
	type: string
	relation: RelationMetadata
	id: string
	tableName: string
	columnName: string
	fieldName: string
	collectionName: string
	propertyName: string
	otherSide: {
		tableName: string
		columnName: string
		fieldName: string
		collectionName: string
		propertyName?: string
		relationId?: string
	}
	junction?: {
		uniqueKey: string
		tableName: string
		collectionName: string
		collectionAuthzKey: string
		thisSide: {
			columnName: string
			fieldName: string
			propertyName: string
		}
		otherSide: {
			columnName: string
			fieldName: string
			propertyName: string
		}
	}
}

/**
 * Direct Relation
 */
export type DirectRelation = BaseRelation & {
	type: "many-to-one" | "one-to-many" | "owner-one-to-one" | "ref-one-to-one"
}

/**
 * Junction Relation
 *
 * It has `junction` property as required
 */
export type JunctionRelation = SetRequired<BaseRelation, "junction"> & { type: "many-to-many" }

/**
 * Relation Definition
 */
export type RelationDef = DirectRelation | JunctionRelation
