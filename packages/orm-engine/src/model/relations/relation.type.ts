export type SingleRelationType = "many-to-one" | "owner-one-to-one" | "ref-one-to-one"
export type ArrayRelationType = "one-to-many" | "many-to-many"
export type RelationType = SingleRelationType | ArrayRelationType
