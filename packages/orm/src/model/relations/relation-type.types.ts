//
// I do not know why I have to have this ugly workaround.
// I tried with `type ManyToOne = "many-to-one"`, `type ManyToOne = Opaque<"many-to-one">`,
// and with `class ManyToOne extends SingleRelationType`. Nothing works
//
//

export type ManyToOne = string
export type OneToMany = number
export type OwnerOneToOne = boolean
export type RefOneToOne = Date
export type ManyToMany = symbol

export type SingleRelationType = ManyToOne | OwnerOneToOne | RefOneToOne // "many-to-one" | "owner-one-to-one" | "ref-one-to-one"
export type ArrayRelationType = OneToMany | ManyToMany //"one-to-many" | "many-to-many"
export type RelationType = SingleRelationType | ArrayRelationType
