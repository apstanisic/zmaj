import { EntityRef } from "@orm/crud-types/entity-ref.type"

export type ManyToMany<T> = EntityRef<T>[]
