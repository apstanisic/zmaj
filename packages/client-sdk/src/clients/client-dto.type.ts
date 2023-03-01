import { CreateDto, EntityRef, ToManyChange } from "@zmaj-js/common"

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
