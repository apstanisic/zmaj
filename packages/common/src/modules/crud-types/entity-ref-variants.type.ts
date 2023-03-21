import { EntityRef } from "./entity-ref.type"
import { ManyToMany, ManyToOne, OneToMany, OneToOne } from "./relation.types"

export type EntityRefVariants<T> =
	| EntityRef<T>
	| EntityRef<T>[]
	| readonly EntityRef<T>[]
	| OneToMany<T>
	| ManyToOne<T>
	| OneToOne<T>
	| ManyToMany<T>
