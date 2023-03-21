import { EntityRef } from "./entity-ref.type"

export type ManyToOne<T> = EntityRef<T>
export type ManyToMany<T> = EntityRef<T>[]
export type OneToMany<T> = EntityRef<T>[]
export type OneToOne<T> = EntityRef<T>[]
