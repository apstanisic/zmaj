import { EntityRef } from "@orm/crud-types/entity-ref.type"

export type OneToMany<T> = EntityRef<T>[]
