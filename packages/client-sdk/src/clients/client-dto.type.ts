import { ToManyChange } from "@zmaj-js/common"
import { CreateDto, EntityRef } from "@zmaj-js/orm-common"

export type IsToManyOrmRelation<T> = EntityRef<T>[] | readonly EntityRef<T>[]

type ExcludeRelationKey<T, Key extends keyof T> = T[Key] extends
	| IsToManyOrmRelation<unknown>
	| null
	| undefined
	? Key
	: never

export type ClientDto<T> = CreateDto<T> & {
	[K in keyof T as ExcludeRelationKey<T, K>]: ToManyChange
}
