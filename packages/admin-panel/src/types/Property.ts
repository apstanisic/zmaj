import { DirectRelation, FieldDef, JunctionRelation } from "@zmaj-js/common"

// render not implemented everywhere
type Common = { property: string }

/** Field property. If field is part of m2o, don't use this type, use m2o */
export type FieldProperty = Common & {
	field: FieldDef
	type: "field"
	Render?: () => JSX.Element
}

/**
 * Many to one property with both field and relation.
 * Field that is here should not be registered standalone
 */
type ManyToOneProperty = Common & {
	field: FieldDef
	relation: DirectRelation
	type: "many-to-one" | "owner-one-to-one"
}

/** One to many property */
type OneToManyProperty = Common & {
	relation: DirectRelation
	type: "one-to-many" | "ref-one-to-one"
}

/** Many to many property */
type ManyToManyProperty = Common & {
	relation: JunctionRelation
	type: "many-to-many"
}

/**
 * Property is either field or relation
 *
 * Field should not be simple field and many to one relation at the same time
 */
export type Property =
	| FieldProperty //
	| ManyToOneProperty
	| OneToManyProperty
	| ManyToManyProperty
